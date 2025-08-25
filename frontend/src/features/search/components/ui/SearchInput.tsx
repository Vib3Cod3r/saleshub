import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchStore } from '../../stores/searchStore';
import { useSearchSuggestions } from '../../hooks/useSearchQuery';
import { cn } from '../../../../lib/utils';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search contacts, companies, deals...",
  className,
  onSearch,
  showSuggestions = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, suggestions, setSuggestions } = useSearchStore();
  
  const { data: apiSuggestions } = useSearchSuggestions(query.text || '');

  useEffect(() => {
    if (apiSuggestions) {
      setSuggestions(apiSuggestions);
    }
  }, [apiSuggestions, setSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery({ text: value, page: 1 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.(query.text || '');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery({ text: suggestion, page: 1 });
    onSearch?.(suggestion);
    setIsFocused(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query.text || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {showSuggestions && isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
