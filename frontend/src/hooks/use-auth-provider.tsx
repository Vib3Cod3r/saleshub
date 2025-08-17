'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'

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
        console.log('Token validation failed, removing token')
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (error) {
      console.error('Token validation error:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8089/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      const { token, user: userData } = data

      localStorage.setItem('token', token)
      setUser(userData)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const response = await fetch('http://localhost:8089/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Registration failed')
      }

      const data = await response.json()
      const { token, user: newUser } = data

      localStorage.setItem('token', token)
      setUser(newUser)
    } catch (error) {
      console.error('Registration error:', error)
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
