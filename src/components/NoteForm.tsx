import React, { useState, useEffect } from 'react'
import { NotesService, NotesUtils } from '../lib/notes'
import { AISummaryService, SUMMARY_PRESETS } from '../lib/ai-summary'
import type { Note, CreateNoteData, UpdateNoteData, AISummaryData } from '../types'
import { Save, X, FileText, Type, AlertCircle, Sparkles, Brain, Loader2, Tag } from 'lucide-react'

interface NoteFormProps {
  note?: Note | null // Jeśli przekazano notatkę, to edycja; jeśli null/undefined, to tworzenie
  onSave?: (note: Note) => void
  onCancel?: () => void
  onError?: (error: string) => void
  className?: string
}

// Helper function to safely convert to string
function safeString(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function NoteForm({
  note = null,
  onSave,
  onCancel,
  onError,
  className = ''
}: NoteFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // AI Summary states
  const [aiSummaryData, setAiSummaryData] = useState<AISummaryData | null>(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [showAIFeatures, setShowAIFeatures] = useState(AISummaryService.isAvailable())

  const isEditing = Boolean(note)

  // Wypełnij formularz danymi notatki jeśli edytujemy
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setSummary(safeString(note.summary))
      setCategory(safeString(note.category))
      setTags(note.tags || [])
    } else {
      setTitle('')
      setContent('')
      setSummary('')
      setCategory('')
      setTags([])
    }
    setError(null)
    setSummaryError(null)
    setAiSummaryData(null)
  }, [note])

  // AI Summary functions
  const generateAISummary = async (preset: keyof typeof SUMMARY_PRESETS = 'detailed') => {
    if (!content.trim()) {
      setSummaryError('Najpierw wprowadź treść notatki')
      return
    }

    setGeneratingSummary(true)
    setSummaryError(null)

    try {
      const result = await AISummaryService.generateSummary(
        content, 
        title || undefined, 
        SUMMARY_PRESETS[preset]
      )
      
      setAiSummaryData(result)
      setSummary(safeString(result.summary))
      setCategory(safeString(result.category || category))
      if (result.keyPoints) {
        // Konwertuj key points na tagi
        const newTags = result.keyPoints.slice(0, 5)
        setTags(prev => [...new Set([...prev, ...newTags])])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się wygenerować podsumowania'
      setSummaryError(errorMessage)
    } finally {
      setGeneratingSummary(false)
    }
  }

  const generateQuickSummary = async () => {
    if (!content.trim()) return

    setGeneratingSummary(true)
    try {
      const quickSummary = await AISummaryService.generateQuickSummary(content, title || undefined)
      setSummary(safeString(quickSummary))
    } catch (err) {
      setSummaryError('Nie udało się wygenerować szybkiego podsumowania')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags(prev => [...prev, tag.trim()])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Tytuł notatki jest wymagany')
      return false
    }
    if (!content.trim()) {
      setError('Treść notatki jest wymagana')
      return false
    }
    if (title.length > 200) {
      setError('Tytuł nie może być dłuższy niż 200 znaków')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      let savedNote: Note

      if (isEditing && note) {
        // Edycja istniejącej notatki
        const cleanSummary = safeString(summary).trim()
        const cleanCategory = safeString(category).trim()
        
        const updateData: UpdateNoteData = {
          title: title.trim(),
          content: content.trim(),
          summary: cleanSummary || NotesUtils.generateSummary(content.trim()),
          category: cleanCategory || null,
          tags: tags.length > 0 ? tags : null
        }
        savedNote = await NotesService.updateNote(note.id, updateData)
      } else {
        // Tworzenie nowej notatki
        const createData: CreateNoteData = {
          title: title.trim(),
          content: content.trim()
        }
        savedNote = await NotesService.createNote(createData)
        
        // Po utworzeniu, zaktualizuj z AI danymi jeśli są dostępne
        const cleanSummary2 = safeString(summary).trim()
        const cleanCategory2 = safeString(category).trim()
        
        if (cleanSummary2 || cleanCategory2 || tags.length > 0) {
          const updateData: UpdateNoteData = {
            summary: cleanSummary2 || NotesUtils.generateSummary(content.trim()),
            category: cleanCategory2 || null,
            tags: tags.length > 0 ? tags : null
          }
          savedNote = await NotesService.updateNote(savedNote.id, updateData)
        }
      }

      // Reset formularza jeśli tworzymy nową notatkę
      if (!isEditing) {
        setTitle('')
        setContent('')
        setSummary('')
        setCategory('')
        setTags([])
        setAiSummaryData(null)
      }

      onSave?.(savedNote)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (!isEditing) {
      setTitle('')
      setContent('')
      setSummary('')
      setCategory('')
      setTags([])
      setAiSummaryData(null)
    }
    setError(null)
    setSummaryError(null)
    onCancel?.()
  }

  const wordCount = NotesUtils.countWords(content)
  const readingTime = content.trim() ? NotesUtils.estimateReadingTime(content) : null

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edytuj notatkę' : 'Nowa notatka'}
            </h2>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pole tytułu */}
          <div>
            <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-2">
              <Type className="h-4 w-4 inline mr-1" />
              Tytuł notatki
            </label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wprowadź tytuł notatki..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={200}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {title.length}/200 znaków
            </div>
          </div>

          {/* Pole treści */}
          <div>
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-2">
              Treść notatki
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Wprowadź treść notatki..."
              disabled={loading}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{wordCount} słów</span>
              {readingTime && <span>{readingTime}</span>}
            </div>
          </div>

          {/* AI Summary Section */}
          {showAIFeatures && content.trim().length > 50 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">AI Asystent</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => generateQuickSummary()}
                    disabled={generatingSummary || loading}
                    className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {generatingSummary ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    <span>Szybkie podsumowanie</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => generateAISummary('detailed')}
                    disabled={generatingSummary || loading}
                    className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {generatingSummary ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Brain className="h-3 w-3" />
                    )}
                    <span>Pełna analiza</span>
                  </button>
                </div>
              </div>

              {summaryError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{summaryError}</p>
                </div>
              )}

              {/* Podsumowanie */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="note-summary" className="block text-sm font-medium text-gray-700 mb-2">
                    Podsumowanie
                  </label>
                  <textarea
                    id="note-summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Automatyczne podsumowanie notatki..."
                    disabled={loading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
                  />
                </div>

                {/* Kategoria */}
                <div>
                  <label htmlFor="note-category" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategoria
                  </label>
                  <select
                    id="note-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Wybierz kategorię...</option>
                    <option value="Praca">Praca</option>
                    <option value="Osobiste">Osobiste</option>
                    <option value="Nauka">Nauka</option>
                    <option value="Projekty">Projekty</option>
                    <option value="Pomysły">Pomysły</option>
                    <option value="Spotkania">Spotkania</option>
                    <option value="Zadania">Zadania</option>
                    <option value="Zakupy">Zakupy</option>
                    <option value="Podróże">Podróże</option>
                    <option value="Inne">Inne</option>
                  </select>
                </div>

                {/* Tagi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Tagi
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Dodaj tag (Enter)"
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          addTag(input.value.trim())
                          input.value = ''
                        }
                      }
                    }}
                  />
                </div>

                {/* AI Analysis Results */}
                {aiSummaryData && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-900 mb-3">Analiza AI</h4>
                    <div className="space-y-3 text-sm">
                      {aiSummaryData.keyPoints.length > 0 && (
                        <div>
                          <span className="font-medium text-purple-800">Kluczowe punkty:</span>
                          <ul className="mt-1 list-disc list-inside text-purple-700">
                            {aiSummaryData.keyPoints.map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {aiSummaryData.sentiment && (
                        <div>
                          <span className="font-medium text-purple-800">Sentyment: </span>
                          <span className={`text-sm ${
                            aiSummaryData.sentiment === 'positive' ? 'text-green-600' :
                            aiSummaryData.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {aiSummaryData.sentiment === 'positive' ? '😊 Pozytywny' :
                             aiSummaryData.sentiment === 'negative' ? '😔 Negatywny' : '😐 Neutralny'}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium text-purple-800">Pewność analizy: </span>
                        <span className="text-purple-700">{Math.round(aiSummaryData.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Przyciski akcji */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anuluj
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Zapisywanie...' : (isEditing ? 'Zapisz zmiany' : 'Utwórz notatkę')}</span>
            </button>
          </div>
        </form>

        {/* Podgląd podsumowania podczas pisania */}
        {content.trim() && content.length > 50 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border-l-4 border-blue-500">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Podgląd podsumowania:</h4>
            <p className="text-sm text-gray-600 italic">
              "{NotesUtils.generateSummary(content)}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
