import React, { useState } from 'react'
import { NotesService, NotesUtils } from '../lib/notes'
import type { Note } from '../types'
import { 
  Edit3, 
  Trash2, 
  Clock, 
  Eye, 
  EyeOff, 
  Calendar,
  BookOpen,
  AlertTriangle,
  Star,
  Tag,
  FolderOpen,
  Brain
} from 'lucide-react'

interface NoteCardProps {
  note: Note
  onEdit?: (note: Note) => void
  onDelete?: (noteId: string) => void
  onError?: (error: string) => void
  className?: string
  showFullContent?: boolean
}

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onError,
  className = '',
  showFullContent = false
}: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullContent)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEdit = () => {
    onEdit?.(note)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await NotesService.deleteNote(note.id)
      onDelete?.(note.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć notatki'
      onError?.(errorMessage)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const formattedDate = NotesUtils.formatDate(note.created_at)
  const isRecentlyCreated = NotesUtils.isRecentlyCreated(note.created_at)
  const wasEdited = NotesUtils.wasRecentlyEdited(note.created_at, note.updated_at)
  const wordCount = NotesUtils.countWords(note.content)
  const readingTime = NotesUtils.estimateReadingTime(note.content)

  const shouldTruncate = note.content.length > 300 && !isExpanded
  const displayContent = shouldTruncate 
    ? NotesUtils.truncateText(note.content, 300)
    : note.content

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Header notatki */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
              {note.title}
              {isRecentlyCreated && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <Star className="h-3 w-3 mr-1" />
                  Nowe
                </span>
              )}
            </h3>
            
            {/* Kategoria i tagi */}
            {(note.category || note.tags?.length) && (
              <div className="mt-2 flex items-center flex-wrap gap-2">
                {note.category && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-md">
                    <FolderOpen className="h-3 w-3 mr-1" />
                    {note.category}
                  </span>
                )}
                {note.tags && note.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
                {note.tags && note.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-md">
                    +{note.tags.length - 3} więcej
                  </span>
                )}
              </div>
            )}
            
            {/* Metadane */}
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
                {wasEdited && (
                  <span className="text-blue-600 font-medium">(edytowane)</span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{wordCount} słów</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{readingTime}</span>
              </div>
              
              {(note.summary && note.summary !== NotesUtils.generateSummary(note.content)) && (
                <div className="flex items-center space-x-1 text-purple-600">
                  <Brain className="h-4 w-4" />
                  <span>AI</span>
                </div>
              )}
            </div>
          </div>

          {/* Przyciski akcji */}
          <div className="flex items-center space-x-2 ml-4">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edytuj notatkę"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Usuń notatkę"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Treść notatki */}
      <div className="p-4">
        {/* Podsumowanie (jeśli istnieje) */}
        {note.summary && note.summary !== note.content && (
          <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r">
            <p className="text-sm text-blue-800 italic">
              <strong>Podsumowanie:</strong> {note.summary}
            </p>
          </div>
        )}

        {/* Treść */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {displayContent}
          </p>
        </div>

        {/* Przycisk rozwijania treści */}
        {note.content.length > 300 && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={toggleExpanded}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Zwiń</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Pokaż więcej</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal potwierdzenia usunięcia */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Usuń notatkę
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Czy na pewno chcesz usunąć notatkę "{note.title}"?
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Ta akcja jest nieodwracalna. Wszystkie dane notatki zostaną trwale usunięte.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isDeleting ? 'Usuwanie...' : 'Usuń notatkę'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
