import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader2, Database, Key, Globe } from 'lucide-react'

export default function SupabaseTest() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [details, setDetails] = useState<{
    url?: string
    hasKey?: boolean
    canConnect?: boolean
    error?: string
  }>({})

  useEffect(() => {
    checkSupabaseConnection()
  }, [])

  const checkSupabaseConnection = async () => {
    try {
      setStatus('checking')
      
      // Dynamically import supabase to avoid build issues
      const { supabase } = await import('../lib/supabase')
      
      // Check basic config
      const url = supabase.supabaseUrl
      const hasKey = supabase.supabaseKey && supabase.supabaseKey.length > 10
      
      // Try to connect to Supabase
      const { data, error } = await supabase.auth.getSession()
      
      if (error && !error.message.includes('session')) {
        throw error
      }
      
      setDetails({
        url: url,
        hasKey,
        canConnect: true
      })
      setStatus('connected')
      
    } catch (error) {
      try {
        const { supabase } = await import('../lib/supabase')
        setDetails({
          error: error instanceof Error ? error.message : 'Unknown error',
          url: supabase.supabaseUrl,
          hasKey: supabase.supabaseKey && supabase.supabaseKey.length > 10,
          canConnect: false
        })
      } catch {
        setDetails({
          error: error instanceof Error ? error.message : 'Unknown error',
          url: 'Not configured',
          hasKey: false,
          canConnect: false
        })
      }
      setStatus('error')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Sprawdzanie połączenia z Supabase...'
      case 'connected':
        return 'Połączenie z Supabase działa poprawnie! ✨'
      case 'error':
        return 'Problem z połączeniem Supabase'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50'
      case 'connected':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className={`border rounded-lg p-6 ${getStatusColor()}`}>
      <div className="flex items-center space-x-3 mb-4">
        {getStatusIcon()}
        <h3 className="text-lg font-semibold text-gray-900">
          Status Supabase
        </h3>
      </div>
      
      <p className="text-sm text-gray-700 mb-4">
        {getStatusText()}
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">URL:</span>
          <code className="text-xs bg-gray-200 px-2 py-1 rounded">
            {details.url || 'Nie skonfigurowany'}
          </code>
        </div>
        
        <div className="flex items-center space-x-2">
          <Key className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">API Key:</span>
          <span className={`text-xs px-2 py-1 rounded ${
            details.hasKey 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {details.hasKey ? 'Skonfigurowany' : 'Brak'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Połączenie:</span>
          <span className={`text-xs px-2 py-1 rounded ${
            details.canConnect 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {details.canConnect ? 'Działa' : 'Błąd'}
          </span>
        </div>
      </div>
      
      {details.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded">
          <p className="text-sm text-red-700">
            <strong>Błąd:</strong> {details.error}
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-700">
            <strong>Rozwiązanie:</strong> Sprawdź instrukcje w pliku{' '}
            <code className="bg-white px-1 py-0.5 rounded">SETUP_SUPABASE.md</code>
          </p>
        </div>
      )}
      
      <button
        onClick={checkSupabaseConnection}
        disabled={status === 'checking'}
        className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'checking' ? 'Sprawdzanie...' : 'Sprawdź ponownie'}
      </button>
    </div>
  )
}
