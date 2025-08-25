'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Download, FileText, CheckSquare, Calendar } from 'lucide-react'
import type { Contact, Company } from '@/types/crm'

interface DataExportProps {
  type: 'contacts' | 'companies'
  data: Contact[] | Company[]
  filters?: any
  onExport: (format: 'csv' | 'json', options: ExportOptions) => void
}

interface ExportOptions {
  includeHeaders: boolean
  dateFormat: 'iso' | 'local' | 'custom'
  customDateFormat?: string
  selectedFields: string[]
}

export function DataExport({ type, data, filters, onExport }: DataExportProps) {
  const getDefaultFields = (type: 'contacts' | 'companies'): string[] => {
    if (type === 'contacts') {
      return ['firstName', 'lastName', 'email', 'phone', 'title', 'status', 'company', 'tags', 'createdAt']
    } else {
      return ['name', 'industry', 'website', 'size', 'status', 'address', 'createdAt']
    }
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeHeaders: true,
    dateFormat: 'iso',
    selectedFields: getDefaultFields(type),
  })

  const availableFields = type === 'contacts' ? [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'title', label: 'Job Title' },
    { key: 'status', label: 'Status' },
    { key: 'company', label: 'Company' },
    { key: 'tags', label: 'Tags' },
    { key: 'notes', label: 'Notes' },
    { key: 'createdAt', label: 'Created Date' },
    { key: 'updatedAt', label: 'Updated Date' },
  ] : [
    { key: 'name', label: 'Company Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'website', label: 'Website' },
    { key: 'size', label: 'Company Size' },
    { key: 'status', label: 'Status' },
    { key: 'address', label: 'Address' },
    { key: 'createdAt', label: 'Created Date' },
    { key: 'updatedAt', label: 'Updated Date' },
  ]

  const handleExport = (format: 'csv' | 'json') => {
    onExport(format, exportOptions)
    setModalOpen(false)
  }

  const toggleField = (fieldKey: string) => {
    setExportOptions(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(fieldKey)
        ? prev.selectedFields.filter(f => f !== fieldKey)
        : [...prev.selectedFields, fieldKey]
    }))
  }

  const selectAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedFields: availableFields.map(f => f.key)
    }))
  }

  const clearAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedFields: []
    }))
  }

  return (
    <>
      <Button
        variant="outline"
        leftIcon={<Download />}
        onClick={() => setModalOpen(true)}
      >
        Export {type}
      </Button>

      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <Modal.Content size="lg">
          <Modal.Header>
            Export {type.charAt(0).toUpperCase() + type.slice(1)}
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              {/* Export Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Records:</span>
                      <span className="ml-2">{data.length}</span>
                    </div>
                    <div>
                      <span className="font-medium">Selected Fields:</span>
                      <span className="ml-2">{exportOptions.selectedFields.length}</span>
                    </div>
                    {filters && Object.keys(filters).length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Applied Filters:</span>
                        <span className="ml-2 text-gray-600">
                          {Object.entries(filters)
                            .filter(([_, value]) => value !== undefined && value !== '')
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Include Headers */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeHeaders"
                      checked={exportOptions.includeHeaders}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        includeHeaders: e.target.checked
                      }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="includeHeaders" className="text-sm font-medium">
                      Include column headers
                    </label>
                  </div>

                  {/* Date Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={exportOptions.dateFormat}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateFormat: e.target.value as 'iso' | 'local' | 'custom'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="iso">ISO 8601 (2024-01-15T10:00:00Z)</option>
                      <option value="local">Local Format (01/15/2024)</option>
                      <option value="custom">Custom Format</option>
                    </select>
                  </div>

                  {exportOptions.dateFormat === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Date Format
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., MM/DD/YYYY"
                        value={exportOptions.customDateFormat || ''}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          customDateFormat: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Field Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Select Fields</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllFields}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFields}
                      >
                        Clear All
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {availableFields.map((field) => (
                      <div key={field.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={field.key}
                          checked={exportOptions.selectedFields.includes(field.key)}
                          onChange={() => toggleField(field.key)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={field.key} className="text-sm">
                          {field.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  leftIcon={<FileText />}
                  onClick={() => handleExport('csv')}
                  disabled={exportOptions.selectedFields.length === 0}
                >
                  Export CSV
                </Button>
                <Button
                  leftIcon={<FileText />}
                  onClick={() => handleExport('json')}
                  disabled={exportOptions.selectedFields.length === 0}
                >
                  Export JSON
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}
