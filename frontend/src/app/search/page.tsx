'use client';

import React, { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AdvancedSearchBar } from '../../features/search/components/advanced/AdvancedSearchBar';
import { AdvancedFilters } from '../../features/search/components/filters/AdvancedFilters';
import { SearchResultsGrid } from '../../features/search/components/results/SearchResultsGrid';
import { SearchAnalytics } from '../../features/search/components/analytics/SearchAnalytics';
import { useAuth } from '../../shared/contexts/AuthContext';

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the search functionality.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Advanced Search</h1>
            <p className="mt-2 text-gray-600">
              Search across all your CRM data with advanced filtering and analytics
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <AdvancedSearchBar 
              placeholder="Search contacts, companies, deals, leads, tasks..."
              showFilters={true}
              showHistory={true}
            />
          </div>

          {/* Filters and Analytics Toggle */}
          <div className="flex items-center justify-between mb-6">
            <AdvancedFilters 
              isOpen={showFilters}
              onToggle={setShowFilters}
            />
            
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>📊</span>
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
          </div>

          {/* Analytics Section */}
          {showAnalytics && (
            <div className="mb-8">
              <SearchAnalytics 
                timeRange="7d"
                showDetails={true}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <AdvancedFilters 
                    isOpen={true}
                    onToggle={setShowFilters}
                  />
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
              <SearchResultsGrid 
                showViewToggle={true}
                defaultView="grid"
                itemsPerPage={20}
              />
            </div>
          </div>
        </div>
      </div>
      
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
