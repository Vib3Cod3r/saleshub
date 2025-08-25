import React, { useState } from 'react';
import { ViewColumnsIcon, ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useSearchStore } from '../../stores/searchStore';
import { SearchResultCard } from './SearchResultCard';
import { SearchResultItem } from './SearchResultItem';
import { cn } from '../../../../shared/utils/cn';

type ViewMode = 'grid' | 'list' | 'compact';

interface SearchResultsGridProps {
  className?: string;
  showViewToggle?: boolean;
  defaultView?: ViewMode;
  itemsPerPage?: number;
}

export const SearchResultsGrid: React.FC<SearchResultsGridProps> = ({
  className,
  showViewToggle = true,
  defaultView = 'grid',
  itemsPerPage = 20
}) => {
  const { results, loading, error, query } = useSearchStore();
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [currentPage, setCurrentPage] = useState(1);

  const handleItemClick = (item: Record<string, unknown>) => {
    // TODO: Navigate to item detail page
    console.log('Item clicked:', item);
  };

  const renderViewToggle = () => {
    if (!showViewToggle) return null;

    const viewOptions = [
      { mode: 'grid' as ViewMode, icon: Squares2X2Icon, label: 'Grid' },
      { mode: 'list' as ViewMode, icon: ListBulletIcon, label: 'List' },
      { mode: 'compact' as ViewMode, icon: ViewColumnsIcon, label: 'Compact' },
    ];

    return (
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {viewOptions.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              viewMode === mode
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
            title={label}
          >
            <Icon className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderResultsCount = () => {
    if (!results) return null;

    const total = results.pagination?.total || 0;
    const current = results.data?.length || 0;
    const page = results.pagination?.page || 1;
    const totalPages = results.pagination?.totalPages || 1;

    return (
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {current} of {total} results
          {query.text && (
            <span className="ml-1">
              for "<span className="font-medium">{query.text}</span>"
            </span>
          )}
        </span>
        {totalPages > 1 && (
          <span>
            Page {page} of {totalPages}
          </span>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (!results?.pagination || results.pagination.totalPages <= 1) return null;

    const { page, totalPages } = results.pagination;
    const pages = [];
    
    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => setCurrentPage(1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 text-sm text-gray-500 bg-white border-t border-b border-gray-300">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={cn(
            "px-3 py-2 text-sm font-medium border-t border-b border-gray-300",
            i === page
              ? "bg-blue-50 text-blue-600 border-blue-500"
              : "bg-white text-gray-500 hover:bg-gray-50"
          )}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 text-sm text-gray-500 bg-white border-t border-b border-gray-300">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return (
      <div className="flex justify-center mt-6">
        <nav className="flex" aria-label="Pagination">
          {pages}
        </nav>
      </div>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Searching...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-sm text-gray-600">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    if (!results?.data || results.data.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">🔍</div>
            <p className="text-sm text-gray-600">No results found</p>
            {query.text && (
              <p className="text-xs text-gray-500 mt-1">
                Try adjusting your search terms or filters
              </p>
            )}
          </div>
        </div>
      );
    }

    const items = results.data;

    switch (viewMode) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item: any, index: number) => (
              <SearchResultCard
                key={index}
                item={item}
                query={query.text}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <SearchResultCard
                key={index}
                item={item}
                query={query.text}
                onClick={() => handleItemClick(item)}
                className="!p-6"
              />
            ))}
          </div>
        );

      case 'compact':
        return (
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <SearchResultItem
                key={index}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {renderResultsCount()}
        {renderViewToggle()}
      </div>

      {/* Results */}
      {renderResults()}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};
