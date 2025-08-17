import React, { useState } from 'react'
import Navigation from './Navigation'
import ProtectedRoute from './ProtectedRoute'
import SupabaseTest from './SupabaseTest'
import NotesList from './NotesList'
import NoteForm from './NoteForm'
import { NotesProvider, useNotes } from '../lib/notes-context'
import type { Note } from '../types'
import { X, ChevronLeft, AlertCircle } from 'lucide-react'

// Główny komponent Dashboard z Provider
export default function Dashboard() {
  return (
    <ProtectedRoute>
      <NotesProvider>
        <DashboardContent />
      </NotesProvider>
    </ProtectedRoute>
  )
}

// Zawartość Dashboard korzystająca z kontekstu notatek
function DashboardContent() {
  const { state, startCreatingNote, startEditingNote, cancelCreatingNote, cancelEditingNote, clearError } = useNotes()
  const [showSupabaseTest, setShowSupabaseTest] = useState(false)

  const handleCreateNote = () => {
    startCreatingNote()
  }

  const handleEditNote = (note: Note) => {
    startEditingNote(note)
  }

  const handleNoteSaved = () => {
    // Po zapisaniu notatki, zamknij formularz
    if (state.isCreatingNote) {
      cancelCreatingNote()
    }
    if (state.isEditingNote) {
      cancelEditingNote()
    }
  }

  const handleCancelForm = () => {
    if (state.isCreatingNote) {
      cancelCreatingNote()
    }
    if (state.isEditingNote) {
      cancelEditingNote()
    }
  }

  const handleError = (error: string) => {
    console.error('Dashboard error:', error)
    // Błąd jest już obsłużony w kontekście
  }

  return (
    <>
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Nagłówek z opcjami */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AI Notes 📝
                </h1>
                <p className="mt-2 text-gray-600">
                  Twoje inteligentne notatki w jednym miejscu
                </p>
              </div>
              
              <button
                onClick={() => setShowSupabaseTest(!showSupabaseTest)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                {showSupabaseTest ? 'Ukryj test' : 'Pokaż test połączenia'}
              </button>
            </div>
          </div>

          {/* Test połączenia Supabase (opcjonalny) */}
          {showSupabaseTest && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                🧪 Test połączenia Supabase
              </h2>
              <SupabaseTest />
            </div>
          )}

          {/* Błędy globalne */}
          {state.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Główna zawartość */}
          <div className="space-y-6">
            
            {/* Formularz tworzenia/edycji notatki */}
            {(state.isCreatingNote || state.isEditingNote) && (
              <div className="space-y-4">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <button
                    onClick={handleCancelForm}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Powrót do listy</span>
                  </button>
                  <span>/</span>
                  <span className="text-gray-900">
                    {state.isCreatingNote ? 'Nowa notatka' : 'Edycja notatki'}
                  </span>
                </div>

                {/* Formularz */}
                <NoteForm
                  note={state.isEditingNote ? state.selectedNote : null}
                  onSave={handleNoteSaved}
                  onCancel={handleCancelForm}
                  onError={handleError}
                />
              </div>
            )}

            {/* Lista notatek */}
            {!state.isCreatingNote && !state.isEditingNote && (
              <NotesList
                onCreateNote={handleCreateNote}
                onEditNote={handleEditNote}
                onError={handleError}
              />
            )}

          </div>
        </div>
      </main>
    </>
  )
}
