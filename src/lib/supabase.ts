import { createClient } from '@supabase/supabase-js'

// Get environment variables with safe defaults
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

// Create a function to safely create Supabase client
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return mock client for build/SSR when env vars are missing
    console.warn('🚨 Supabase environment variables not configured')
    
    // Create a minimal client that won't crash during build
    return createClient(
      'https://localhost:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    )
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          title: string
          content: string
          summary: string | null
          category: string | null
          tags: string[] | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          summary?: string | null
          category?: string | null
          tags?: string[] | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          summary?: string | null
          category?: string | null
          tags?: string[] | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
