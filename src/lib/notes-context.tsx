import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { NotesService } from './notes'
import type { Note, CreateNoteData, UpdateNoteData } from '../types'
import { useAuth } from './auth-context'

// Typy stanu notatek
interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
  searchQuery: string
  selectedNote: Note | null
  isCreatingNote: boolean
  isEditingNote: boolean
}

// Typy akcji
type NotesAction =
  | { type: 'NOTES_LOADING' }
  | { type: 'NOTES_LOADED'; payload: Note[] }
  | { type: 'NOTES_ERROR'; payload: string }
  | { type: 'NOTE_CREATED'; payload: Note }
  | { type: 'NOTE_UPDATED'; payload: Note }
  | { type: 'NOTE_DELETED'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SELECT_NOTE'; payload: Note | null }
  | { type: 'SET_CREATING_NOTE'; payload: boolean }
  | { type: 'SET_EDITING_NOTE'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' }

// Reducer do zarządzania stanem
function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'NOTES_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      }

    case 'NOTES_LOADED':
      return {
        ...state,
        notes: action.payload,
        loading: false,
        error: null
      }

    case 'NOTES_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    case 'NOTE_CREATED':
      return {
        ...state,
        notes: [action.payload, ...state.notes],
        isCreatingNote: false,
        selectedNote: action.payload,
        error: null
      }

    case 'NOTE_UPDATED':
      return {
        ...state,
        notes: state.notes.map(note => 
          note.id === action.payload.id ? action.payload : note
        ),
        selectedNote: action.payload,
        isEditingNote: false,
        error: null
      }

    case 'NOTE_DELETED':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        selectedNote: state.selectedNote?.id === action.payload ? null : state.selectedNote,
        error: null
      }

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      }

    case 'SELECT_NOTE':
      return {
        ...state,
        selectedNote: action.payload,
        isCreatingNote: false,
        isEditingNote: false
      }

    case 'SET_CREATING_NOTE':
      return {
        ...state,
        isCreatingNote: action.payload,
        isEditingNote: false,
        selectedNote: null
      }

    case 'SET_EDITING_NOTE':
      return {
        ...state,
        isEditingNote: action.payload,
        isCreatingNote: false
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    case 'RESET_STATE':
      return initialState

    default:
      return state
  }
}

// Stan początkowy
const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedNote: null,
  isCreatingNote: false,
  isEditingNote: false
}

// Typ kontekstu
interface NotesContextType {
  // Stan
  state: NotesState
  
  // Podstawowe operacje CRUD
  loadNotes: () => Promise<void>
  createNote: (data: CreateNoteData) => Promise<Note>
  updateNote: (id: string, data: UpdateNoteData) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
  refreshNotes: () => Promise<void>
  
  // Wyszukiwanie
  searchNotes: (query: string) => Promise<Note[]>
  setSearchQuery: (query: string) => void
  
  // Zarządzanie stanem UI
  selectNote: (note: Note | null) => void
  startCreatingNote: () => void
  startEditingNote: (note: Note) => void
  cancelCreatingNote: () => void
  cancelEditingNote: () => void
  
  // Obsługa błędów
  clearError: () => void
  
  // Filtrowane i posortowane notatki
  getFilteredNotes: () => Note[]
}

// Kontekst
const NotesContext = createContext<NotesContextType | undefined>(undefined)

// Provider kontekstu
interface NotesProviderProps {
  children: React.ReactNode
}

export function NotesProvider({ children }: NotesProviderProps) {
  const [state, dispatch] = useReducer(notesReducer, initialState)
  const { user } = useAuth()

  // Załaduj notatki przy logowaniu użytkownika
  useEffect(() => {
    if (user) {
      loadNotes()
      
      // Subskrybuj real-time zmiany
      const subscription = NotesService.subscribeToNotes(
        user.id,
        // onInsert
        (note) => {
          dispatch({ type: 'NOTE_CREATED', payload: note })
        },
        // onUpdate
        (note) => {
          dispatch({ type: 'NOTE_UPDATED', payload: note })
        },
        // onDelete
        (noteId) => {
          dispatch({ type: 'NOTE_DELETED', payload: noteId })
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    } else {
      // Reset stanu gdy użytkownik się wyloguje
      dispatch({ type: 'RESET_STATE' })
    }
  }, [user])

  // Podstawowe operacje CRUD
  const loadNotes = useCallback(async () => {
    if (!user) return

    dispatch({ type: 'NOTES_LOADING' })
    try {
      const notes = await NotesService.getNotes()
      dispatch({ type: 'NOTES_LOADED', payload: notes })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się załadować notatek'
      dispatch({ type: 'NOTES_ERROR', payload: errorMessage })
    }
  }, [user])

  const createNote = useCallback(async (data: CreateNoteData): Promise<Note> => {
    try {
      const note = await NotesService.createNote(data)
      dispatch({ type: 'NOTE_CREATED', payload: note })
      return note
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się utworzyć notatki'
      dispatch({ type: 'NOTES_ERROR', payload: errorMessage })
      throw error
    }
  }, [])

  const updateNote = useCallback(async (id: string, data: UpdateNoteData): Promise<Note> => {
    try {
      const note = await NotesService.updateNote(id, data)
      dispatch({ type: 'NOTE_UPDATED', payload: note })
      return note
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się zaktualizować notatki'
      dispatch({ type: 'NOTES_ERROR', payload: errorMessage })
      throw error
    }
  }, [])

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    try {
      await NotesService.deleteNote(id)
      dispatch({ type: 'NOTE_DELETED', payload: id })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się usunąć notatki'
      dispatch({ type: 'NOTES_ERROR', payload: errorMessage })
      throw error
    }
  }, [])

  const refreshNotes = useCallback(async () => {
    await loadNotes()
  }, [loadNotes])

  // Wyszukiwanie
  const searchNotes = useCallback(async (query: string): Promise<Note[]> => {
    try {
      if (!query.trim()) {
        return state.notes
      }
      const results = await NotesService.searchNotes(query)
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się wyszukać notatek'
      dispatch({ type: 'NOTES_ERROR', payload: errorMessage })
      return []
    }
  }, [state.notes])

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
  }, [])

  // Zarządzanie stanem UI
  const selectNote = useCallback((note: Note | null) => {
    dispatch({ type: 'SELECT_NOTE', payload: note })
  }, [])

  const startCreatingNote = useCallback(() => {
    dispatch({ type: 'SET_CREATING_NOTE', payload: true })
  }, [])

  const startEditingNote = useCallback((note: Note) => {
    dispatch({ type: 'SELECT_NOTE', payload: note })
    dispatch({ type: 'SET_EDITING_NOTE', payload: true })
  }, [])

  const cancelCreatingNote = useCallback(() => {
    dispatch({ type: 'SET_CREATING_NOTE', payload: false })
  }, [])

  const cancelEditingNote = useCallback(() => {
    dispatch({ type: 'SET_EDITING_NOTE', payload: false })
  }, [])

  // Obsługa błędów
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // Filtrowane notatki
  const getFilteredNotes = useCallback((): Note[] => {
    if (!state.searchQuery.trim()) {
      return state.notes
    }

    const query = state.searchQuery.toLowerCase().trim()
    return state.notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query) ||
      note.summary?.toLowerCase().includes(query)
    )
  }, [state.notes, state.searchQuery])

  const contextValue: NotesContextType = {
    state,
    
    // CRUD
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
    
    // Wyszukiwanie
    searchNotes,
    setSearchQuery,
    
    // UI
    selectNote,
    startCreatingNote,
    startEditingNote,
    cancelCreatingNote,
    cancelEditingNote,
    
    // Błędy
    clearError,
    
    // Filtrowanie
    getFilteredNotes
  }

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  )
}

// Hook do używania kontekstu
export function useNotes(): NotesContextType {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}

// Eksport dla łatwiejszego importu
export { NotesContext }
