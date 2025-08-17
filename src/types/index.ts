export interface Note {
  id: string
  title: string
  content: string
  summary: string | null
  category?: string | null
  tags?: string[] | null
  user_id: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export interface CreateNoteData {
  title: string
  content: string
}

export interface UpdateNoteData {
  title?: string
  content?: string
  summary?: string | null
  category?: string | null
  tags?: string[] | null
}

// Typy dla AI Summary
export interface AISummaryData {
  summary: string
  keyPoints: string[]
  category?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  tags?: string[]
  confidence: number
}
