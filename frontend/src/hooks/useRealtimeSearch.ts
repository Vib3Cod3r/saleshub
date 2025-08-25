import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from './useWebSocket'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface SearchSuggestion {
  id: string
  text: string
  type: 'contact' | 'company' | 'deal' | 'tag'
  relevance: number
  userId?: string
  userName?: string
}

interface SearchSession {
  id: string
  query: string
  participants: Array<{
    userId: string
    userName: string
    joinedAt: string
  }>
  suggestions: SearchSuggestion[]
  createdAt: string
}

export function useRealtimeSearch() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { isConnected, sendMessage } = useWebSocket()
  const [activeSessions, setActiveSessions] = useState<SearchSession[]>([])
  const [currentSession, setCurrentSession] = useState<SearchSession | null>(null)
  const [liveSuggestions, setLiveSuggestions] = useState<SearchSuggestion[]>([])

  // Handle real-time search updates
  useEffect(() => {
    if (!isConnected) return

    const handleSearchUpdate = (data: any) => {
      const { type, payload } = data
      
      switch (type) {
        case 'search_suggestion':
          // Add new search suggestion
          setLiveSuggestions(prev => {
            const existing = prev.find(s => s.id === payload.suggestion.id)
            if (existing) {
              return prev.map(s => s.id === payload.suggestion.id ? payload.suggestion : s)
            }
            return [payload.suggestion, ...prev.slice(0, 9)] // Keep top 10
          })
          
          // Show notification for suggestions from other users
          if (payload.userId !== user?.id) {
            toast(`${payload.userName} suggested: "${payload.suggestion.text}"`, {
              icon: '🔍',
              duration: 3000,
            })
          }
          break

        case 'search_session_joined':
          // User joined search session
          setActiveSessions(prev => {
            const session = prev.find(s => s.id === payload.sessionId)
            if (session) {
              const updatedSession = {
                ...session,
                participants: [...session.participants, {
                  userId: payload.userId,
                  userName: payload.userName,
                  joinedAt: payload.timestamp,
                }]
              }
              return prev.map(s => s.id === payload.sessionId ? updatedSession : s)
            }
            return prev
          })
          
          if (payload.userId !== user?.id) {
            toast(`${payload.userName} joined the search session`, {
              icon: '👥',
              duration: 2000,
            })
          }
          break

        case 'search_session_left':
          // User left search session
          setActiveSessions(prev => {
            const session = prev.find(s => s.id === payload.sessionId)
            if (session) {
              const updatedSession = {
                ...session,
                participants: session.participants.filter(p => p.userId !== payload.userId)
              }
              return prev.map(s => s.id === payload.sessionId ? updatedSession : s)
            }
            return prev
          })
          
          if (payload.userId !== user?.id) {
            toast(`${payload.userName} left the search session`, {
              icon: '👋',
              duration: 2000,
            })
          }
          break

        case 'search_results_updated':
          // Search results updated
          queryClient.setQueryData(['search-results', payload.query], payload.results)
          
          if (payload.userId !== user?.id) {
            toast(`Search results updated by ${payload.userName}`, {
              icon: '📊',
              duration: 2000,
            })
          }
          break

        case 'search_analytics':
          // Search analytics update
          queryClient.setQueryData(['search-analytics'], (old: any) => {
            if (!old) return payload.analytics
            return { ...old, ...payload.analytics }
          })
          break

        default:
          console.log('Unknown search update type:', type)
      }
    }

    // Listen for search updates
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'search_update') {
          handleSearchUpdate(message.payload)
        }
      } catch (error) {
        console.error('Failed to handle search update:', error)
      }
    }

    // Add event listener for WebSocket messages
    const socket = (window as any).__websocket__
    if (socket) {
      socket.addEventListener('message', handleMessage)
    }

    return () => {
      if (socket) {
        socket.removeEventListener('message', handleMessage)
      }
    }
  }, [isConnected, queryClient, user])

  // Create new search session
  const createSearchSession = useCallback((query: string) => {
    if (!isConnected || !user) return null

    const session: SearchSession = {
      id: `session-${Date.now()}`,
      query,
      participants: [{
        userId: user.id,
        userName: user.name,
        joinedAt: new Date().toISOString(),
      }],
      suggestions: [],
      createdAt: new Date().toISOString(),
    }

    setCurrentSession(session)
    setActiveSessions(prev => [session, ...prev])

    // Notify other users
    sendMessage({
      type: 'search_update',
      payload: {
        type: 'search_session_created',
        session,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
      }
    })

    return session
  }, [isConnected, user, sendMessage])

  // Join existing search session
  const joinSearchSession = useCallback((sessionId: string) => {
    if (!isConnected || !user) return false

    const session = activeSessions.find(s => s.id === sessionId)
    if (!session) return false

    setCurrentSession(session)

    // Notify other users
    sendMessage({
      type: 'search_update',
      payload: {
        type: 'search_session_joined',
        sessionId,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
      }
    })

    return true
  }, [isConnected, user, sendMessage, activeSessions])

  // Leave search session
  const leaveSearchSession = useCallback((sessionId: string) => {
    if (!isConnected || !user) return

    setCurrentSession(null)

    // Notify other users
    sendMessage({
      type: 'search_update',
      payload: {
        type: 'search_session_left',
        sessionId,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
      }
    })
  }, [isConnected, user, sendMessage])

  // Add search suggestion
  const addSearchSuggestion = useCallback((suggestion: Omit<SearchSuggestion, 'id'>) => {
    if (!isConnected || !user) return

    const fullSuggestion: SearchSuggestion = {
      ...suggestion,
      id: `suggestion-${Date.now()}`,
      userId: user.id,
      userName: user.name,
    }

    setLiveSuggestions(prev => [fullSuggestion, ...prev.slice(0, 9)])

    // Notify other users
    sendMessage({
      type: 'search_update',
      payload: {
        type: 'search_suggestion',
        suggestion: fullSuggestion,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
      }
    })
  }, [isConnected, user, sendMessage])

  // Update search results
  const updateSearchResults = useCallback((query: string, results: any[]) => {
    if (!isConnected || !user) return

    // Update local cache
    queryClient.setQueryData(['search-results', query], results)

    // Notify other users
    sendMessage({
      type: 'search_update',
      payload: {
        type: 'search_results_updated',
        query,
        results,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
      }
    })
  }, [isConnected, user, sendMessage, queryClient])

  // Track search analytics
  const trackSearchAnalytics = useCallback((action: string, data: any) => {
    if (!isConnected || !user) return

    sendMessage({
      type: 'search_update',
      payload: {
        type: 'search_analytics',
        action,
        data,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
      }
    })
  }, [isConnected, user, sendMessage])

  return {
    // State
    activeSessions,
    currentSession,
    liveSuggestions,
    isConnected,
    
    // Actions
    createSearchSession,
    joinSearchSession,
    leaveSearchSession,
    addSearchSuggestion,
    updateSearchResults,
    trackSearchAnalytics,
  }
}
