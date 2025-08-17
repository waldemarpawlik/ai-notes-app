import { supabase } from './supabase'
import type { Note, CreateNoteData, UpdateNoteData } from '../types'

export class NotesService {
  /**
   * Tworzy nową notatkę
   */
  static async createNote(data: CreateNoteData): Promise<Note> {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userData.user) {
      throw new Error('Musisz być zalogowany, aby utworzyć notatkę')
    }

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        title: data.title,
        content: data.content,
        user_id: userData.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Błąd podczas tworzenia notatki:', error)
      throw new Error(`Nie udało się utworzyć notatki: ${error.message}`)
    }

    return note
  }

  /**
   * Pobiera wszystkie notatki użytkownika
   */
  static async getNotes(): Promise<Note[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userData.user) {
      throw new Error('Musisz być zalogowany, aby zobaczyć notatki')
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Błąd podczas pobierania notatek:', error)
      throw new Error(`Nie udało się pobrać notatek: ${error.message}`)
    }

    return notes || []
  }

  /**
   * Pobiera pojedynczą notatkę po ID
   */
  static async getNoteById(id: string): Promise<Note | null> {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userData.user) {
      throw new Error('Musisz być zalogowany, aby zobaczyć notatkę')
    }

    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Notatka nie istnieje
      }
      console.error('Błąd podczas pobierania notatki:', error)
      throw new Error(`Nie udało się pobrać notatki: ${error.message}`)
    }

    return note
  }

  /**
   * Aktualizuje notatkę
   */
  static async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userData.user) {
      throw new Error('Musisz być zalogowany, aby edytować notatkę')
    }

    const { data: note, error } = await supabase
      .from('notes')
      .update(data)
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .select()
      .single()

    if (error) {
      console.error('Błąd podczas aktualizacji notatki:', error)
      throw new Error(`Nie udało się zaktualizować notatki: ${error.message}`)
    }

    return note
  }

  /**
   * Usuwa notatkę
   */
  static async deleteNote(id: string): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userData.user) {
      throw new Error('Musisz być zalogowany, aby usunąć notatkę')
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id)

    if (error) {
      console.error('Błąd podczas usuwania notatki:', error)
      throw new Error(`Nie udało się usunąć notatki: ${error.message}`)
    }
  }

  /**
   * Wyszukuje notatki po tytule lub treści
   */
  static async searchNotes(query: string): Promise<Note[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userData.user) {
      throw new Error('Musisz być zalogowany, aby wyszukiwać notatki')
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userData.user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Błąd podczas wyszukiwania notatek:', error)
      throw new Error(`Nie udało się wyszukać notatek: ${error.message}`)
    }

    return notes || []
  }

  /**
   * Subskrybuje zmiany w notatkach użytkownika (real-time)
   */
  static subscribeToNotes(
    userId: string,
    onInsert?: (note: Note) => void,
    onUpdate?: (note: Note) => void,
    onDelete?: (noteId: string) => void
  ) {
    const subscription = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (onInsert) {
            onInsert(payload.new as Note)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (onUpdate) {
            onUpdate(payload.new as Note)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (onDelete) {
            onDelete(payload.old.id)
          }
        }
      )
      .subscribe()

    return subscription
  }
}

/**
 * Funkcje pomocnicze do formatowania i przetwarzania notatek
 */
export class NotesUtils {
  /**
   * Formatuje datę do wyświetlania
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) {
      return 'przed chwilą'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min temu`
    } else if (diffInHours < 24) {
      return `${diffInHours} godz. temu`
    } else if (diffInDays < 7) {
      return `${diffInDays} dni temu`
    } else {
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
  }

  /**
   * Skraca tekst do określonej długości
   */
  static truncateText(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) {
      return text
    }
    return text.substring(0, maxLength).trim() + '...'
  }

  /**
   * Generuje podsumowanie treści notatki
   */
  static generateSummary(content: string): string {
    // Proste podsumowanie - pierwsze zdanie lub pierwsze 100 znaków
    const sentences = content.split(/[.!?]+/)
    const firstSentence = sentences[0]?.trim()
    
    if (firstSentence && firstSentence.length > 20 && firstSentence.length <= 200) {
      return firstSentence + '.'
    }
    
    return this.truncateText(content, 100)
  }

  /**
   * Sprawdza czy notatka została niedawno utworzona (w ciągu ostatnich 24h)
   */
  static isRecentlyCreated(dateString: string): boolean {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    
    return diffInHours <= 24
  }

  /**
   * Sprawdza czy notatka została ostatnio edytowana
   */
  static wasRecentlyEdited(createdAt: string, updatedAt: string): boolean {
    const created = new Date(createdAt)
    const updated = new Date(updatedAt)
    const diffInMs = updated.getTime() - created.getTime()
    
    // Jeśli różnica jest większa niż 1 minuta, to została edytowana
    return diffInMs > 60000
  }

  /**
   * Zlicza słowa w tekście
   */
  static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Estymuje czas czytania (słowa per minuta)
   */
  static estimateReadingTime(text: string, wordsPerMinute: number = 200): string {
    const wordCount = this.countWords(text)
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    
    if (minutes === 1) {
      return '1 minuta czytania'
    } else if (minutes < 5) {
      return `${minutes} minuty czytania`
    } else {
      return `${minutes} minut czytania`
    }
  }
}

/**
 * Hook pomocniczy do zarządzania stanem notatek (możemy go użyć później w kontekście)
 */
export interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
  searchQuery: string
}

export const initialNotesState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  searchQuery: '',
}
