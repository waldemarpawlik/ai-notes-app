import OpenAI from 'openai'

// Konfiguracja OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Uwaga: W produkcji należy używać backend API
})

// Typy dla AI Summary
export interface SummaryOptions {
  length?: 'short' | 'medium' | 'long'
  style?: 'bullet' | 'paragraph' | 'keywords'
  language?: 'pl' | 'en'
}

export interface SummaryResult {
  summary: string
  keyPoints: string[]
  category?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  wordCount: number
  confidence: number
}

export class AISummaryService {
  private static isConfigured(): boolean {
    return Boolean(import.meta.env.PUBLIC_OPENAI_API_KEY)
  }

  /**
   * Sprawdza czy AI Summary jest dostępne
   */
  static isAvailable(): boolean {
    return this.isConfigured()
  }

  /**
   * Generuje podsumowanie notatki za pomocą OpenAI
   */
  static async generateSummary(
    content: string, 
    title?: string,
    options: SummaryOptions = {}
  ): Promise<SummaryResult> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key nie jest skonfigurowany. Dodaj PUBLIC_OPENAI_API_KEY do zmiennych środowiskowych.')
    }

    if (!content.trim()) {
      throw new Error('Treść notatki nie może być pusta')
    }

    const {
      length = 'medium',
      style = 'paragraph',
      language = 'pl'
    } = options

    try {
      const prompt = this.buildPrompt(content, title, { length, style, language })
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Jesteś ekspertem w tworzeniu podsumowań i analizie tekstu. Zawsze odpowiadasz w języku polskim w formacie JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })

      const responseContent = completion.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('Brak odpowiedzi z API OpenAI')
      }

      const result = JSON.parse(responseContent) as SummaryResult
      
      // Walidacja i uzupełnienie wyniku
      return {
        summary: result.summary || 'Nie udało się wygenerować podsumowania',
        keyPoints: result.keyPoints || [],
        category: result.category || 'Ogólne',
        sentiment: result.sentiment || 'neutral',
        wordCount: result.wordCount || this.countWords(result.summary || ''),
        confidence: result.confidence || 0.8
      }

    } catch (error) {
      console.error('Błąd podczas generowania podsumowania:', error)
      
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('Błąd autoryzacji OpenAI API. Sprawdź klucz API.')
      }
      
      throw new Error('Nie udało się wygenerować podsumowania. Spróbuj ponownie.')
    }
  }

  /**
   * Generuje szybkie podsumowanie bez analizy (dla dużych notatek)
   */
  static async generateQuickSummary(content: string, title?: string): Promise<string> {
    if (!this.isConfigured()) {
      // Fallback do prostego podsumowania
      return this.generateSimpleSummary(content)
    }

    try {
      const prompt = `Napisz krótkie podsumowanie (max 2 zdania) tej notatki w języku polskim:

${title ? `Tytuł: ${title}` : ''}

Treść:
${content.slice(0, 1000)}${content.length > 1000 ? '...' : ''}

Podsumowanie:`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tworzysz krótkie, zwięzłe podsumowania w języku polskim. Maksymalnie 2 zdania.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })

      return completion.choices[0]?.message?.content?.trim() || this.generateSimpleSummary(content)

    } catch (error) {
      console.error('Błąd quick summary:', error)
      return this.generateSimpleSummary(content)
    }
  }

  /**
   * Analizuje kategorię notatki
   */
  static async categorizeNote(content: string, title?: string): Promise<string> {
    if (!this.isConfigured()) {
      return 'Ogólne'
    }

    try {
      const prompt = `Określ kategorię tej notatki. Wybierz jedną z kategorii: Praca, Osobiste, Nauka, Projekty, Pomysły, Spotkania, Zadania, Zakupy, Podróże, Inne.

${title ? `Tytuł: ${title}` : ''}
Treść: ${content.slice(0, 500)}

Kategoria:`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 20
      })

      const category = completion.choices[0]?.message?.content?.trim()
      const validCategories = ['Praca', 'Osobiste', 'Nauka', 'Projekty', 'Pomysły', 'Spotkania', 'Zadania', 'Zakupy', 'Podróże']
      
      return validCategories.includes(category || '') ? category! : 'Inne'

    } catch (error) {
      console.error('Błąd kategoryzacji:', error)
      return 'Ogólne'
    }
  }

  /**
   * Generuje tagi dla notatki
   */
  static async generateTags(content: string, title?: string): Promise<string[]> {
    if (!this.isConfigured()) {
      return []
    }

    try {
      const prompt = `Wygeneruj 3-5 tagów (pojedyncze słowa) dla tej notatki w języku polskim:

${title ? `Tytuł: ${title}` : ''}
Treść: ${content.slice(0, 500)}

Tagi (oddzielone przecinkami):`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      })

      const tagsString = completion.choices[0]?.message?.content?.trim()
      if (!tagsString) return []

      return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5)

    } catch (error) {
      console.error('Błąd generowania tagów:', error)
      return []
    }
  }

  // Prywatne metody pomocnicze

  private static buildPrompt(content: string, title?: string, options: SummaryOptions): string {
    const lengthInstructions = {
      short: 'bardzo krótkie (1-2 zdania)',
      medium: 'średnie (3-4 zdania)', 
      long: 'szczegółowe (5-7 zdań)'
    }

    const styleInstructions = {
      bullet: 'w formie punktów',
      paragraph: 'w formie paragrafu',
      keywords: 'w formie słów kluczowych'
    }

    return `Przeanalizuj tę notatkę i zwróć wynik w formacie JSON z następującymi polami:
- summary: ${lengthInstructions[options.length!]} podsumowanie ${styleInstructions[options.style!]}
- keyPoints: tablica najważniejszych punktów (3-5 elementów)
- category: kategoria notatki (jedna z: Praca, Osobiste, Nauka, Projekty, Pomysły, Spotkania, Zadania, Zakupy, Podróże, Inne)
- sentiment: sentyment tekstu (positive/neutral/negative)
- wordCount: liczba słów w podsumowaniu
- confidence: pewność analizy (0.0-1.0)

${title ? `Tytuł: ${title}` : ''}

Treść notatki:
${content}

Odpowiedz w formacie JSON:`
  }

  private static generateSimpleSummary(content: string): string {
    // Fallback - proste podsumowanie bez AI
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length === 0) {
      return content.slice(0, 100) + (content.length > 100 ? '...' : '')
    }
    
    if (sentences.length <= 2) {
      return sentences.join('. ').trim() + '.'
    }
    
    // Weź pierwsze zdanie i ostatnie
    return `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }
}

// Pomocnicze typy i stałe
export const SUMMARY_PRESETS = {
  quick: { length: 'short' as const, style: 'paragraph' as const },
  detailed: { length: 'long' as const, style: 'bullet' as const },
  keywords: { length: 'medium' as const, style: 'keywords' as const }
} as const

export const CATEGORIES = [
  'Praca',
  'Osobiste', 
  'Nauka',
  'Projekty',
  'Pomysły',
  'Spotkania',
  'Zadania',
  'Zakupy',
  'Podróże',
  'Inne'
] as const

export type NoteCategory = typeof CATEGORIES[number]
