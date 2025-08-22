'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface AddColumnModalProps {
  isOpen: boolean
  onClose: () => void
  onAddColumn: (columnData: {
    id: string
    label: string
    key: string
    width: string
    type: string
  }) => void
}

export function AddColumnModal({ isOpen, onClose, onAddColumn }: AddColumnModalProps) {
  const [formData, setFormData] = useState({
    label: '',
    key: '',
    width: 'w-48',
    type: 'text'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.label.trim() || !formData.key.trim()) {
      return
    }

    const columnData = {
      id: `custom_${Date.now()}`,
      label: formData.label.toUpperCase(),
      key: formData.key,
      width: formData.width,
      type: formData.type
    }

    onAddColumn(columnData)
    setFormData({ label: '', key: '', width: 'w-48', type: 'text' })
    onClose()
  }

  const handleClose = () => {
    setFormData({ label: '', key: '', width: 'w-48', type: 'text' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Column</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                Column Label
              </label>
              <input
                type="text"
                id="label"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Department"
                required
              />
            </div>

            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
                Field Key
              </label>
              <input
                type="text"
                id="key"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., department"
                required
              />
            </div>

            <div>
              <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                Column Width
              </label>
              <select
                id="width"
                value={formData.width}
                onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="w-32">Small (w-32)</option>
                <option value="w-40">Medium (w-40)</option>
                <option value="w-48">Default (w-48)</option>
                <option value="w-56">Large (w-56)</option>
                <option value="w-64">Extra Large (w-64)</option>
                <option value="w-72">Wide (w-72)</option>
                <option value="w-80">Extra Wide (w-80)</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="date">Date</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
            >
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
