import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
// Using a simple search icon instead of Heroicons
const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  score: number;
}

interface RealTimeSearchBarProps {
  onSearchResults?: (results: SearchResult[]) => void;
  onSearchStart?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const RealTimeSearchBar = ({
  onSearchResults,
  onSearchStart,
  placeholder = "Search contacts, companies, deals...",
  className = ""
}: RealTimeSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchSessionId, setSearchSessionId] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const { isConnected } = useWebSocket();

  // Handle real-time search results from WebSocket
  useEffect(() => {
    if (!isConnected) return;

    // Note: WebSocket message handling is managed by the useWebSocket hook
    // Search-specific operations would be handled through the hook's message handling
    console.log('Real-time search bar connected to WebSocket');
  }, [isConnected, searchSessionId, onSearchResults]);

  // Debounced search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    onSearchStart?.(searchQuery);

    try {
      // Create or join search session
      if (!searchSessionId) {
        const sessionResponse = await fetch('/api/enhanced-search/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            participants: ['current-user'], // This would be the actual user ID
            initialQuery: searchQuery
          })
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSearchSessionId(sessionData.data.session.id);
        }
      }

      // Perform live search
      const response = await fetch('/api/enhanced-search/live-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          query: searchQuery,
          sessionId: searchSessionId,
          entityType: 'all'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.data.results || []);
        onSearchResults?.(data.data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowResults(true);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms debounce
  };

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    console.log('Selected result:', result);
    setShowResults(false);
    // Navigate to the result or perform action
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute -top-8 right-0 text-xs text-red-500">
          ⚠️ Offline mode
        </div>
      )}

      {/* Search Results */}
      {showResults && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={`${result.id}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{result.title}</div>
                      {result.description && (
                        <div className="text-sm text-gray-600 mt-1">{result.description}</div>
                      )}
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {result.type}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          Score: {Math.round(result.score * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() && !isSearching ? (
                         <div className="px-4 py-8 text-center text-gray-500">
               <SearchIcon />
               <p>No results found for "{query}"</p>
             </div>
          ) : null}
        </div>
      )}

      {/* Search Session Info */}
      {searchSessionId && (
        <div className="absolute -bottom-8 left-0 text-xs text-blue-600">
          🔗 Collaborative session active
        </div>
      )}
    </div>
  );
};
