'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { errorLogger } from '@/lib/error-logger'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token and validate it
    const token = localStorage.getItem('token')
    if (token) {
      validateToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8089/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token')
        errorLogger.log('auth', 'Token validation failed', {
          status: response.status,
          statusText: response.statusText
        })
      }
    } catch (error) {
      errorLogger.log('auth', 'Token validation error', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      errorLogger.log('auth', 'Attempting login', { email })
      
      const response = await fetch('http://localhost:8089/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Login failed'
        errorLogger.log('auth', 'Login failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        })
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Handle both response structures: { token, user } and { data: { token, user } }
      let token: string
      let userData: User
      
      if (data.data && data.data.token && data.data.user) {
        // Nested structure: { data: { token, user } }
        token = data.data.token
        userData = data.data.user
      } else if (data.token && data.user) {
        // Direct structure: { token, user }
        token = data.token
        userData = data.user
      } else {
        // Invalid response structure
        errorLogger.log('auth', 'Invalid response structure', {
          responseData: data,
          expectedStructures: ['{ token, user }', '{ data: { token, user } }']
        })
        throw new Error('Invalid response structure from server')
      }

      localStorage.setItem('token', token)
      setUser(userData)
      errorLogger.log('auth', 'Login successful', { userId: userData.id })
    } catch (error) {
      errorLogger.log('auth', 'Login error', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      errorLogger.log('auth', 'Attempting registration', { email: userData.email })
      
      const response = await fetch('http://localhost:8089/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Registration failed'
        errorLogger.log('auth', 'Registration failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        })
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Handle both response structures: { token, user } and { data: { token, user } }
      let token: string
      let newUser: User
      
      if (data.data && data.data.token && data.data.user) {
        // Nested structure: { data: { token, user } }
        token = data.data.token
        newUser = data.data.user
      } else if (data.token && data.user) {
        // Direct structure: { token, user }
        token = data.token
        newUser = data.user
      } else {
        // Invalid response structure
        errorLogger.log('auth', 'Invalid response structure', {
          responseData: data,
          expectedStructures: ['{ token, user }', '{ data: { token, user } }']
        })
        throw new Error('Invalid response structure from server')
      }

      localStorage.setItem('token', token)
      setUser(newUser)
      errorLogger.log('auth', 'Registration successful', { userId: newUser.id })
    } catch (error) {
      errorLogger.log('auth', 'Registration error', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
