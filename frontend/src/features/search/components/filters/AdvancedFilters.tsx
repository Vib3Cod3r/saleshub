import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, BookmarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useSearchStore } from '../../stores/searchStore';
import { FilterCriteria, FilterOperator } from '../../../../shared/types/search';
import { cn } from '../../../../shared/utils/cn';

interface AdvancedFiltersProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

const FILTER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'in', label: 'In' },
  { value: 'notIn', label: 'Not in' },
  { value: 'gt', label: 'Greater than' },
  { value: 'gte', label: 'Greater than or equal' },
  { value: 'lt', label: 'Less than' },
  { value: 'lte', label: 'Less than or equal' },
  { value: 'between', label: 'Between' },
  { value: 'isNull', label: 'Is empty' },
  { value: 'isNotNull', label: 'Is not empty' },
];

const COMMON_FIELDS = [
  { value: 'name', label: 'Name', type: 'text' },
  { value: 'email', label: 'Email', type: 'text' },
  { value: 'phone', label: 'Phone', type: 'text' },
  { value: 'company', label: 'Company', type: 'text' },
  { value: 'status', label: 'Status', type: 'select' },
  { value: 'createdAt', label: 'Created Date', type: 'date' },
  { value: 'updatedAt', label: 'Updated Date', type: 'date' },
  { value: 'amount', label: 'Amount', type: 'number' },
  { value: 'priority', label: 'Priority', type: 'select' },
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  className,
  isOpen = false,
  onToggle
}) => {
  const { query, setQuery, filters, addFilter, removeFilter, clearFilters } = useSearchStore();
  const [localFilters, setLocalFilters] = useState<FilterCriteria[]>(filters);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<FilterCriteria>>({});

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleAddFilter = () => {
    if (newFilter.field && newFilter.operator && newFilter.value !== undefined) {
      const filter: FilterCriteria = {
        field: newFilter.field,
        operator: newFilter.operator,
        value: newFilter.value,
        logicalOperator: newFilter.logicalOperator || 'AND'
      };
      addFilter(filter);
      setNewFilter({});
      setShowAddFilter(false);
    }
  };

  const handleRemoveFilter = (index: number) => {
    removeFilter(index);
  };

  const handleApplyFilters = () => {
    setQuery({ filters: localFilters });
  };

  const handleClearAll = () => {
    clearFilters();
    setLocalFilters([]);
    setQuery({ filters: [] });
  };

  const getFieldType = (fieldName: string) => {
    const field = COMMON_FIELDS.find(f => f.value === fieldName);
    return field?.type || 'text';
  };

  const renderValueInput = (fieldName: string, operator: FilterOperator) => {
    const fieldType = getFieldType(fieldName);

    if (operator === 'isNull' || operator === 'isNotNull') {
      return null;
    }

    if (operator === 'between') {
      return (
        <div className="flex gap-2">
          <input
            type={fieldType}
            placeholder="From"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={Array.isArray(newFilter.value) ? newFilter.value[0] || '' : ''}
            onChange={(e) => setNewFilter({
              ...newFilter,
              value: [e.target.value, Array.isArray(newFilter.value) ? newFilter.value[1] || '' : '']
            })}
          />
          <input
            type={fieldType}
            placeholder="To"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={Array.isArray(newFilter.value) ? newFilter.value[1] || '' : ''}
            onChange={(e) => setNewFilter({
              ...newFilter,
              value: [Array.isArray(newFilter.value) ? newFilter.value[0] || '' : '', e.target.value]
            })}
          />
        </div>
      );
    }

    if (operator === 'in' || operator === 'notIn') {
      return (
        <input
          type="text"
          placeholder="Value1, Value2, Value3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={Array.isArray(newFilter.value) ? newFilter.value.join(', ') : ''}
          onChange={(e) => setNewFilter({
            ...newFilter,
            value: e.target.value.split(',').map(v => v.trim()).filter(v => v)
          })}
        />
      );
    }

    return (
      <input
        type={fieldType}
        placeholder="Value"
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={newFilter.value as string || ''}
        onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
      />
    );
  };

  if (!isOpen) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          onClick={() => onToggle?.(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FunnelIcon className="h-4 w-4" />
          Filters
          {filters.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filters.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg shadow-lg p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
        <button
          onClick={() => onToggle?.(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Active Filters</h4>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">
                  {COMMON_FIELDS.find(f => f.value === filter.field)?.label || filter.field}
                </span>
                <span className="text-sm text-gray-500">
                  {FILTER_OPERATORS.find(op => op.value === filter.operator)?.label}
                </span>
                <span className="text-sm text-gray-700">
                  {Array.isArray(filter.value) ? filter.value.join(', ') : String(filter.value)}
                </span>
                <button
                  onClick={() => handleRemoveFilter(index)}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Filter */}
      {showAddFilter ? (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
              <select
                value={newFilter.field || ''}
                onChange={(e) => setNewFilter({ ...newFilter, field: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select field</option>
                {COMMON_FIELDS.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
              <select
                value={newFilter.operator || ''}
                onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as FilterOperator })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select operator</option>
                {FILTER_OPERATORS.map(operator => (
                  <option key={operator.value} value={operator.value}>
                    {operator.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Value */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              {newFilter.field && newFilter.operator && renderValueInput(newFilter.field, newFilter.operator)}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleAddFilter}
              disabled={!newFilter.field || !newFilter.operator || newFilter.value === undefined}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Filter
            </button>
            <button
              onClick={() => {
                setShowAddFilter(false);
                setNewFilter({});
              }}
              className="px-4 py-2 text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddFilter(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4" />
          Add Filter
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {/* TODO: Save filter template */}}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
          >
            <BookmarkIcon className="h-4 w-4" />
            Save Template
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle?.(false)}
            className="px-4 py-2 text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
