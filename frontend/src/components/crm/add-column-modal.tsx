'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { EntityField } from '@/types/entity'

interface AddColumnModalProps {
  availableFields: EntityField[]
  onAddColumn: (fieldName: string) => void
  onClose: () => void
}

export function AddColumnModal({ availableFields, onAddColumn, onClose }: AddColumnModalProps) {
  const [selectedField, setSelectedField] = useState('')

  const handleAddColumn = () => {
    if (selectedField) {
      onAddColumn(selectedField)
    }
  }

  if (availableFields.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add Column</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-500 mb-4">
            All available fields are already added to the table.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Column</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Field
          </label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Choose a field...</option>
            {availableFields.map((field) => (
              <option key={field.name} value={field.name}>
                {field.displayName} ({field.type})
              </option>
            ))}
          </select>
        </div>

        {selectedField && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Field:</strong> {availableFields.find(f => f.name === selectedField)?.displayName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Type:</strong> {availableFields.find(f => f.name === selectedField)?.type}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddColumn}
            disabled={!selectedField}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Add Column
          </Button>
        </div>
      </div>
    </div>
  )
}
