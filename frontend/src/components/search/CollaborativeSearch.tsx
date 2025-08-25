'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Users, Search, MessageSquare, TrendingUp, Tag, Building2, User } from 'lucide-react'
import { useRealtimeSearch } from '@/hooks/useRealtimeSearch'

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

export function CollaborativeSearch() {
  const { 
    activeSessions, 
    currentSession, 
    liveSuggestions, 
    isConnected,
    createSearchSession,
    joinSearchSession,
    leaveSearchSession,
    addSearchSuggestion,
    updateSearchResults,
    trackSearchAnalytics
  } = useRealtimeSearch()

  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Handle search input
  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    setShowSuggestions(value.length > 0)
    
    if (value.length > 2) {
      // Track search analytics
      trackSearchAnalytics('search_input', { query: value, length: value.length })
    }
  }

  // Handle search submission
  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return

    // Create or join search session
    if (!currentSession) {
      createSearchSession(searchQuery)
    }

    // Add to search history
    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(q => q !== searchQuery)]
      return newHistory.slice(0, 10) // Keep last 10 searches
    })

    // Track search analytics
    trackSearchAnalytics('search_submit', { query: searchQuery })

    setShowSuggestions(false)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text)
    setShowSuggestions(false)
    
    // Track suggestion usage
    trackSearchAnalytics('suggestion_click', { suggestion })
  }

  // Add custom suggestion
  const handleAddSuggestion = () => {
    if (!searchQuery.trim()) return

    addSearchSuggestion({
      text: searchQuery,
      type: 'contact', // Default type
      relevance: 1.0,
    })

    setSearchQuery('')
  }

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'contact':
        return <User className="w-4 h-4 text-blue-600" />
      case 'company':
        return <Building2 className="w-4 h-4 text-green-600" />
      case 'deal':
        return <TrendingUp className="w-4 h-4 text-purple-600" />
      case 'tag':
        return <Tag className="w-4 h-4 text-orange-600" />
      default:
        return <Search className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Collaborative Search</span>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
              {currentSession && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Users className="w-3 h-3 mr-1" />
                  {currentSession.participants.length} participants
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search contacts, companies, deals..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  leftIcon={<Search />}
                />
              </div>
              <Button onClick={handleSearchSubmit}>
                Search
              </Button>
              {currentSession && (
                <Button 
                  variant="outline" 
                  onClick={() => leaveSearchSession(currentSession.id)}
                >
                  Leave Session
                </Button>
              )}
            </div>

            {/* Live Suggestions */}
            {showSuggestions && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Live Suggestions</h4>
                <div className="space-y-2">
                  {liveSuggestions.length === 0 ? (
                    <p className="text-sm text-gray-500">No suggestions yet</p>
                  ) : (
                    liveSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center space-x-2">
                          {getSuggestionIcon(suggestion.type)}
                          <span className="text-sm">{suggestion.text}</span>
                          <span className="text-xs text-gray-500">({suggestion.type})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {suggestion.userName && (
                            <span className="text-xs text-gray-500">
                              by {suggestion.userName}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(suggestion.id.split('-')[1])}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                      onClick={() => handleSearchInput(query)}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Search Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Search Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{session.query}</span>
                      <span className="text-sm text-gray-500">
                        {session.participants.length} participants
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {session.participants.map((participant) => (
                        <span
                          key={participant.userId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          {participant.userName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(session.createdAt)}
                    </span>
                    {currentSession?.id !== session.id && (
                      <Button
                        size="sm"
                        onClick={() => joinSearchSession(session.id)}
                      >
                        Join
                      </Button>
                    )}
                    {currentSession?.id === session.id && (
                      <span className="text-xs text-green-600 font-medium">
                        Current Session
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Session Details */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle>Current Search Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Query</h4>
                <p className="text-lg font-semibold">{currentSession.query}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Participants</h4>
                <div className="flex flex-wrap gap-2">
                  {currentSession.participants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full"
                    >
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="text-sm text-blue-800">{participant.userName}</span>
                      <span className="text-xs text-blue-600">
                        {formatTimeAgo(participant.joinedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Session Suggestions</h4>
                <div className="space-y-2">
                  {currentSession.suggestions.length === 0 ? (
                    <p className="text-sm text-gray-500">No suggestions yet</p>
                  ) : (
                    currentSession.suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          {getSuggestionIcon(suggestion.type)}
                          <span className="text-sm">{suggestion.text}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          by {suggestion.userName}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
