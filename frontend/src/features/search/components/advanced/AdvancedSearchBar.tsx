import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useSearchStore } from '../../stores/searchStore';
import { useSearchSuggestions } from '../../hooks/useSearchQuery';
import { cn } from '../../../../shared/utils/cn';
import { debounce } from '../../../../shared/utils/search';

interface AdvancedSearchBarProps {
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
  showHistory?: boolean;
}

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  className,
  placeholder = "Search contacts, companies, deals...",
  showFilters = true,
  showHistory = true
}) => {
  const { query, setQuery, executeSearch, history, suggestions, setSuggestions } = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: apiSuggestions, isLoading: suggestionsLoading } = useSearchSuggestions(query.text || '');

  // Debounced search execution
  const debouncedSearch = debounce(() => {
    if (query.text && query.text.length >= 2) {
      executeSearch();
    }
  }, 300);

  // Update suggestions when API data changes
  useEffect(() => {
    if (apiSuggestions) {
      setSuggestions(apiSuggestions);
    }
  }, [apiSuggestions, setSuggestions]);

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery({ text: value });
    setShowSuggestions(value.length >= 2);
    setShowHistoryDropdown(false);
    debouncedSearch();
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setQuery({ text: suggestion });
    setShowSuggestions(false);
    executeSearch();
    inputRef.current?.blur();
  };

  // Handle history selection
  const handleHistorySelect = (historyItem: any) => {
    setQuery(historyItem);
    setShowHistoryDropdown(false);
    executeSearch();
    inputRef.current?.blur();
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowHistoryDropdown(false);
      inputRef.current?.blur();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowHistoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query.text || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.text && query.text.length >= 2) {
              setShowSuggestions(true);
            } else if (history.length > 0) {
              setShowHistoryDropdown(true);
            }
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />

        {/* Clear button */}
        {query.text && (
          <button
            onClick={() => {
              setQuery({ text: '' });
              setShowSuggestions(false);
              setShowHistoryDropdown(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        {/* Action buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {showHistory && history.length > 0 && (
            <button
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              className="p-1 text-gray-400 hover:text-gray-600 mr-1"
              title="Search History"
            >
              <ClockIcon className="h-4 w-4" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Advanced Filters"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestionsLoading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-1 text-sm">Loading suggestions...</p>
            </div>
          ) : (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* History Dropdown */}
      {showHistoryDropdown && history.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
            Recent Searches
          </div>
          <ul>
            {history.slice(0, 5).map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleHistorySelect(item)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="truncate">{item.text}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {item.entities?.join(', ')}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
