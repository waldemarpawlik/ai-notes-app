import React, { useState, useEffect, useMemo } from 'react'
import { NotesService } from '../lib/notes'
import { AISummaryService } from '../lib/ai-summary'
import type { Note } from '../types'
import NoteCard from './NoteCard'
import { 
  Search, 
  Plus, 
  StickyNote, 
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  Brain,
  Sparkles
} from 'lucide-react'

interface NotesListProps {
  onCreateNote?: () => void
  onEditNote?: (note: Note) => void
  onError?: (error: string) => void
  className?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

type SortOption = 'newest' | 'oldest' | 'title' | 'updated'

export default function NotesList({
  onCreateNote,
  onEditNote,
  onError,
  className = '',
  searchQuery: externalSearchQuery = '',
  onSearchChange
}: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [refreshing, setRefreshing] = useState(false)
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [showAIOptions, setShowAIOptions] = useState(AISummaryService.isAvailable())

  // Używaj zewnętrznego searchQuery jeśli jest przekazane, w przeciwnym razie używaj wewnętrznego
  const searchQuery = onSearchChange ? externalSearchQuery : internalSearchQuery

  // Załaduj notatki przy pierwszym renderze
  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setError(null)
      const fetchedNotes = await NotesService.getNotes()
      setNotes(fetchedNotes)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się załadować notatek'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadNotes()
    setRefreshing(false)
  }

  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query)
    } else {
      setInternalSearchQuery(query)
    }
  }

  const handleNoteDelete = (deletedNoteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== deletedNoteId))
  }

  const handleNoteEdit = (note: Note) => {
    onEditNote?.(note)
  }

  const processBatchSummaries = async () => {
    if (!AISummaryService.isAvailable()) {
      onError?.('AI Summary nie jest dostępne. Skonfiguruj OPENAI_API_KEY.')
      return
    }

    setBatchProcessing(true)
    let processedCount = 0
    let errorCount = 0

    try {
      // Znajdź notatki bez AI podsumowań
      const notesToProcess = notes.filter(note => 
        !note.summary || note.summary === note.content.slice(0, 100) + '...'
      )

      if (notesToProcess.length === 0) {
        onError?.('Wszystkie notatki mają już wygenerowane podsumowania AI.')
        return
      }

      // Przetwarzaj po kolei żeby nie przeciążyć API
      for (const note of notesToProcess.slice(0, 10)) { // Limit na 10 naraz
        try {
          const summary = await AISummaryService.generateQuickSummary(note.content, note.title)
          const category = await AISummaryService.categorizeNote(note.content, note.title)
          
          await NotesService.updateNote(note.id, {
            summary,
            category
          })
          
          // Zaktualizuj lokalny stan
          setNotes(prev => prev.map(n => 
            n.id === note.id ? { ...n, summary, category } : n
          ))
          
          processedCount++
        } catch (err) {
          console.error(`Błąd przetwarzania notatki ${note.id}:`, err)
          errorCount++
        }
      }

      if (processedCount > 0) {
        onError?.(`Pomyślnie przetworzono ${processedCount} notatek${errorCount > 0 ? `, ${errorCount} błędów` : ''}.`)
      }

    } catch (err) {
      onError?.('Wystąpił błąd podczas masowego przetwarzania notatek.')
    } finally {
      setBatchProcessing(false)
    }
  }

  // Filtrowanie i sortowanie notatek
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes

    // Filtrowanie po zapytaniu wyszukiwania
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        note.summary?.toLowerCase().includes(query)
      )
    }

    // Sortowanie
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'title':
          return a.title.localeCompare(b.title, 'pl-PL')
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        default:
          return 0
      }
    })

    return sorted
  }, [notes, searchQuery, sortBy])

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Ładowanie notatek...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Błąd ładowania notatek</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadNotes}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header z wyszukiwaniem i filtrami */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-3">
            <StickyNote className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Moje notatki
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredAndSortedNotes.length} {filteredAndSortedNotes.length === 1 ? 'notatka' : 'notatek'})
              </span>
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Odśwież listę"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {showAIOptions && notes.length > 0 && (
              <button
                onClick={processBatchSummaries}
                disabled={batchProcessing}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Wygeneruj AI podsumowania dla wszystkich notatek"
              >
                {batchProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {batchProcessing ? 'Przetwarzanie...' : 'AI Batch'}
                </span>
              </button>
            )}
            
            {onCreateNote && (
              <button
                onClick={onCreateNote}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nowa notatka</span>
                <span className="sm:hidden">Nowa</span>
              </button>
            )}
          </div>
        </div>

        {/* Wyszukiwanie */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj w notatkach..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sortowanie */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Sortuj:</span>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">
              📅 Najnowsze
            </option>
            <option value="oldest">
              📅 Najstarsze
            </option>
            <option value="updated">
              🔄 Ostatnio edytowane
            </option>
            <option value="title">
              🔤 Alfabetycznie
            </option>
          </select>
        </div>
      </div>

      {/* Lista notatek */}
      {filteredAndSortedNotes.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery.trim() ? (
            // Brak wyników wyszukiwania
            <div>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Brak wyników
              </h3>
              <p className="text-gray-600 mb-4">
                Nie znaleziono notatek pasujących do zapytania "{searchQuery}".
              </p>
              <button
                onClick={() => handleSearchChange('')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Wyczyść wyszukiwanie
              </button>
            </div>
          ) : (
            // Brak notatek w ogóle
            <div>
              <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Brak notatek
              </h3>
              <p className="text-gray-600 mb-4">
                Nie masz jeszcze żadnych notatek. Utwórz swoją pierwszą notatkę!
              </p>
              {onCreateNote && (
                <button
                  onClick={onCreateNote}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Utwórz pierwszą notatkę</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Siatka notatek
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleNoteEdit}
              onDelete={handleNoteDelete}
              onError={onError}
              className="h-fit"
            />
          ))}
        </div>
      )}

      {/* Informacja o wyszukiwaniu */}
      {searchQuery.trim() && filteredAndSortedNotes.length > 0 && (
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Znaleziono {filteredAndSortedNotes.length} {filteredAndSortedNotes.length === 1 ? 'notatkę' : 'notatek'} 
            {' '}pasujących do zapytania "{searchQuery}".
            <button
              onClick={() => handleSearchChange('')}
              className="ml-2 font-medium hover:underline"
            >
              Wyczyść filtr
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
