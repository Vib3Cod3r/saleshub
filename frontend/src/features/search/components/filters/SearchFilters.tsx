import React from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { cn } from '../../../../lib/utils';

interface SearchFiltersProps {
  className?: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ className }) => {
  const { query, setQuery, filters, addFilter, removeFilter, clearFilters } = useSearchStore();

  const entityOptions = [
    { value: 'Contact', label: 'Contacts' },
    { value: 'Company', label: 'Companies' },
    { value: 'Deal', label: 'Deals' },
    { value: 'Lead', label: 'Leads' },
    { value: 'Task', label: 'Tasks' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Date Updated' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
  ];

  const handleEntityChange = (entity: string, checked: boolean) => {
    const currentEntities = query.entities || [];
    if (checked) {
      setQuery({ entities: [...currentEntities, entity] });
    } else {
      setQuery({ entities: currentEntities.filter(e => e !== entity) });
    }
  };

  const handleSortChange = (sortBy: string) => {
    setQuery({ sortBy });
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    setQuery({ sortOrder });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Filters</h3>
      </div>

      {/* Entity Type Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Entity Types</h4>
        <div className="space-y-2">
          {entityOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={query.entities?.includes(option.value) || false}
                onChange={(e) => handleEntityChange(option.value, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Sort By</h4>
        <select
          value={query.sortBy || 'createdAt'}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Sort Order</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => handleSortOrderChange('asc')}
            className={`px-3 py-1 rounded text-sm ${
              query.sortOrder === 'asc'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ascending
          </button>
          <button
            onClick={() => handleSortOrderChange('desc')}
            className={`px-3 py-1 rounded text-sm ${
              query.sortOrder === 'desc'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Descending
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">
                  {filter.field} {filter.operator} {String(filter.value)}
                </span>
                <button
                  onClick={() => removeFilter(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
