import React, { useState } from 'react'
import { AuthProvider } from '../lib/auth-context'
import LoginForm from './LoginForm'

export default function AuthApp() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <AuthProvider>
      <LoginForm 
        isSignUp={isSignUp} 
        onToggleMode={() => setIsSignUp(!isSignUp)} 
      />
    </AuthProvider>
  )
}
