import React from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { SearchResultItem } from './SearchResultItem';
import { cn } from '../../../../lib/utils';

interface SearchResultsProps {
  className?: string;
  onItemClick?: (item: any) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  className,
  onItemClick
}) => {
  const { results, loading, error } = useSearchStore();

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Searching...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-red-500 mb-2">Search Error</div>
        <div className="text-gray-600">{error}</div>
      </div>
    );
  }

  if (!results || results.data.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-gray-500">No results found</div>
        <div className="text-gray-400 text-sm">Try adjusting your search terms</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-sm text-gray-500">
        Found {results.pagination.total} results
      </div>
      
      <div className="space-y-2">
        {results.data.map((item: any, index: number) => (
          <SearchResultItem
            key={item.id || index}
            item={item}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </div>

      {results.pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: results.pagination.totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${
                  i + 1 === results.pagination.page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
