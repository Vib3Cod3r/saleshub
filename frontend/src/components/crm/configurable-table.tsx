'use client'

import { useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Pagination } from '@/components/ui/pagination'
import { EntitySpecification, TableState, ColumnConfig, SortConfig, EntityRecord } from '@/types/entity'
import { AddColumnModal } from './add-column-modal'

interface ConfigurableTableProps {
  entitySpec: EntitySpecification
  data: EntityRecord[]
  loading: boolean
  tableState: TableState
  totalCount: number
  onSortChange: (sort: SortConfig) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onColumnChange: (columns: ColumnConfig[]) => void
}

export function ConfigurableTable({
  entitySpec,
  data,
  loading,
  tableState,
  totalCount,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onColumnChange
}: ConfigurableTableProps) {
  const [showAddColumnModal, setShowAddColumnModal] = useState(false)
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)

  const visibleColumns = tableState.columns.filter(col => col.visible)

  const handleSort = (field: string) => {
    const newDirection = tableState.sort.field === field && tableState.sort.direction === 'asc' ? 'desc' : 'asc'
    onSortChange({ field, direction: newDirection })
  }

  const handleRemoveColumn = (columnId: string) => {
    const updatedColumns = tableState.columns.map(col =>
      col.id === columnId ? { ...col, visible: false } : col
    )
    onColumnChange(updatedColumns)
  }

  const handleAddColumn = (fieldName: string) => {
    const field = entitySpec.fields.find(f => f.name === fieldName)
    if (!field) return

    const newColumn: ColumnConfig = {
      id: fieldName,
      field: fieldName,
      displayName: field.displayName,
      sortable: field.sortable,
      filterable: field.filterable,
      visible: true,
      order: Math.max(...tableState.columns.map(col => col.order), 0) + 1
    }

    const updatedColumns = [...tableState.columns, newColumn]
    onColumnChange(updatedColumns)
    setShowAddColumnModal(false)
  }

  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn === targetColumnId) return

    const draggedIndex = tableState.columns.findIndex(col => col.id === draggedColumn)
    const targetIndex = tableState.columns.findIndex(col => col.id === targetColumnId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const updatedColumns = [...tableState.columns]
    const [draggedColumnConfig] = updatedColumns.splice(draggedIndex, 1)
    updatedColumns.splice(targetIndex, 0, draggedColumnConfig)

    // Update order values
    updatedColumns.forEach((col, index) => {
      col.order = index
    })

    onColumnChange(updatedColumns)
    setDraggedColumn(null)
  }

  const formatCellValue = (value: any, fieldType: string): string => {
    if (value === null || value === undefined) return '-'
    
    switch (fieldType) {
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'boolean':
        return value ? 'Yes' : 'No'
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value
      default:
        return String(value)
    }
  }

  const getAvailableFields = () => {
    const usedFields = new Set(tableState.columns.map(col => col.field))
    return entitySpec.fields.filter(field => !usedFields.has(field.name))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {visibleColumns.map((column) => {
                const field = entitySpec.fields.find(f => f.name === column.field)
                return (
                  <th
                    key={column.id}
                    className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    draggable
                    onDragStart={() => handleDragStart(column.id)}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 text-gray-400 cursor-move flex items-center justify-center">
                          <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                        </div>
                        {column.sortable ? (
                          <button
                            className="flex items-center space-x-1 hover:text-gray-700"
                            onClick={() => handleSort(column.field)}
                          >
                            <span>{column.displayName}</span>
                            <div className="flex flex-col">
                              <ChevronUpIcon 
                                className={`h-3 w-3 ${
                                  tableState.sort.field === column.field && tableState.sort.direction === 'asc' 
                                    ? 'text-orange-500' 
                                    : 'text-gray-400'
                                }`} 
                              />
                              <ChevronDownIcon 
                                className={`h-3 w-3 ${
                                  tableState.sort.field === column.field && tableState.sort.direction === 'desc' 
                                    ? 'text-orange-500' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            </div>
                          </button>
                        ) : (
                          <span>{column.displayName}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveColumn(column.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                )
              })}
              {/* Add Column Button */}
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <button
                  onClick={() => setShowAddColumnModal(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-2"></div>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="px-4 py-8 text-center text-gray-500">
                  No {entitySpec.displayName.toLowerCase()} found
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {visibleColumns.map((column) => {
                    const field = entitySpec.fields.find(f => f.name === column.field)
                    const value = record[column.field]
                    return (
                      <td key={column.id} className="px-4 py-3 text-sm text-gray-900">
                        {formatCellValue(value, field?.type || 'text')}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <Pagination
          currentPage={tableState.page}
          totalPages={Math.ceil(totalCount / tableState.pageSize)}
          pageSize={tableState.pageSize}
          totalItems={totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <AddColumnModal
          availableFields={getAvailableFields()}
          onAddColumn={handleAddColumn}
          onClose={() => setShowAddColumnModal(false)}
        />
      )}
    </div>
  )
}
