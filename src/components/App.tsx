import React, { useState } from 'react'
import { AuthProvider, useAuth } from '../lib/auth-context'
import Dashboard from './Dashboard'
import LoginForm from './LoginForm'

function AuthWrapper() {
  const { user } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)

  if (!user) {
    return (
      <LoginForm 
        isSignUp={isSignUp} 
        onToggleMode={() => setIsSignUp(!isSignUp)} 
      />
    )
  }

  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  )
}
