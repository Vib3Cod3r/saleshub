'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EntitySpecification, FilterConfig, FilterOperator } from '@/types/entity'

interface FilterBuilderProps {
  entitySpec: EntitySpecification
  onAddFilter: (filter: FilterConfig) => void
  onClose: () => void
}

export function FilterBuilder({ entitySpec, onAddFilter, onClose }: FilterBuilderProps) {
  const [selectedField, setSelectedField] = useState('')
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator>('equals')
  const [filterValue, setFilterValue] = useState('')
  const [filterValue2, setFilterValue2] = useState('') // For range filters

  const filterableFields = entitySpec.fields.filter(field => field.filterable)
  const selectedFieldSpec = entitySpec.fields.find(f => f.name === selectedField)

  const getOperatorsForField = (fieldType: string): FilterOperator[] => {
    switch (fieldType) {
      case 'text':
      case 'email':
      case 'phone':
        return ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_null', 'is_not_null']
      case 'number':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'between', 'is_null', 'is_not_null']
      case 'date':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'between', 'is_null', 'is_not_null']
      case 'picklist':
        return ['equals', 'not_equals', 'in', 'not_in', 'is_null', 'is_not_null']
      case 'boolean':
        return ['equals', 'is_null', 'is_not_null']
      default:
        return ['equals', 'not_equals', 'contains', 'not_contains', 'is_null', 'is_not_null']
    }
  }

  const getOperatorDisplayName = (operator: FilterOperator): string => {
    const operatorNames: Record<FilterOperator, string> = {
      equals: 'Equals',
      not_equals: 'Does not equal',
      contains: 'Contains',
      not_contains: 'Does not contain',
      starts_with: 'Starts with',
      ends_with: 'Ends with',
      greater_than: 'Greater than',
      less_than: 'Less than',
      greater_than_or_equal: 'Greater than or equal',
      less_than_or_equal: 'Less than or equal',
      between: 'Between',
      in: 'In',
      not_in: 'Not in',
      is_null: 'Is empty',
      is_not_null: 'Is not empty'
    }
    return operatorNames[operator]
  }

  const handleAddFilter = () => {
    if (!selectedField || !selectedOperator) return

    const filter: FilterConfig = {
      id: `${selectedField}_${Date.now()}`,
      field: selectedField,
      operator: selectedOperator,
      value: selectedOperator === 'between' ? [filterValue, filterValue2] : filterValue,
      displayValue: selectedOperator === 'between' 
        ? `${filterValue} - ${filterValue2}`
        : selectedOperator === 'in' 
        ? filterValue.split(',').map(v => v.trim()).join(', ')
        : filterValue
    }

    onAddFilter(filter)
    resetForm()
  }

  const resetForm = () => {
    setSelectedField('')
    setSelectedOperator('equals')
    setFilterValue('')
    setFilterValue2('')
  }

  const isValueRequired = !['is_null', 'is_not_null'].includes(selectedOperator)
  const isRangeFilter = selectedOperator === 'between'
  const isMultiValueFilter = selectedOperator === 'in' || selectedOperator === 'not_in'

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-end gap-4">
        {/* Field Select */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field
          </label>
          <select
            value={selectedField}
            onChange={(e) => {
              setSelectedField(e.target.value)
              setSelectedOperator('equals')
              setFilterValue('')
              setFilterValue2('')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Select a field...</option>
            {filterableFields.map((field) => (
              <option key={field.name} value={field.name}>
                {field.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Operator Select */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operator
          </label>
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value as FilterOperator)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {selectedFieldSpec && getOperatorsForField(selectedFieldSpec.type).map((operator) => (
              <option key={operator} value={operator}>
                {getOperatorDisplayName(operator)}
              </option>
            ))}
          </select>
        </div>

        {/* Value Input */}
        {isValueRequired && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            {selectedFieldSpec?.type === 'date' ? (
              <input
                type="date"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            ) : selectedFieldSpec?.type === 'picklist' && selectedFieldSpec.picklistOptions ? (
              isMultiValueFilter ? (
                <input
                  type="text"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  placeholder="Enter values separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select...</option>
                  {selectedFieldSpec.picklistOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <input
                type={selectedFieldSpec?.type === 'number' ? 'number' : 'text'}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder={isMultiValueFilter ? "Enter values separated by commas" : "Enter value"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            )}
          </div>
        )}

        {/* Second Value Input for Range Filters */}
        {isRangeFilter && isValueRequired && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            {selectedFieldSpec?.type === 'date' ? (
              <input
                type="date"
                value={filterValue2}
                onChange={(e) => setFilterValue2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            ) : (
              <input
                type={selectedFieldSpec?.type === 'number' ? 'number' : 'text'}
                value={filterValue2}
                onChange={(e) => setFilterValue2(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddFilter}
            disabled={!selectedField || !selectedOperator || (isValueRequired && !filterValue)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Add Filter
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
