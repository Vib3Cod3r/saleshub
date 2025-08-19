'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  LockClosedIcon,
  LockOpenIcon,
  PlusIcon,
  TrashIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'

interface Column {
  id: string
  label: string
  key: string
  width: string
  sortable: boolean
  locked: boolean
  removable: boolean
  type?: string
}

interface ColumnManagerProps {
  column: Column
  onSort: (key: string, direction: 'asc' | 'desc') => void
  onLock: (columnId: string, locked: boolean) => void
  onDelete: (columnId: string) => void
  onAddColumn: (position: 'before' | 'after', referenceColumnId: string) => void
  onMoveColumn: (columnId: string, direction: 'left' | 'right') => void
  currentSortKey: string | null
  currentSortDirection: 'asc' | 'desc'
  position: number
  totalColumns: number
}

export function ColumnManager({
  column,
  onSort,
  onLock,
  onDelete,
  onAddColumn,
  onMoveColumn,
  currentSortKey,
  currentSortDirection,
  position,
  totalColumns
}: ColumnManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSortAscending = () => {
    onSort(column.key, 'asc')
    setIsOpen(false)
  }

  const handleSortDescending = () => {
    onSort(column.key, 'desc')
    setIsOpen(false)
  }

  const handleMoveLeft = () => {
    onMoveColumn(column.id, 'left')
    setIsOpen(false)
  }

  const handleMoveRight = () => {
    onMoveColumn(column.id, 'right')
    setIsOpen(false)
  }

  const handleToggleLock = () => {
    onLock(column.id, !column.locked)
    setIsOpen(false)
  }

  const handleAddColumnBefore = () => {
    onAddColumn('before', column.id)
    setIsOpen(false)
  }

  const handleAddColumnAfter = () => {
    onAddColumn('after', column.id)
    setIsOpen(false)
  }

  const handleDeleteColumn = () => {
    onDelete(column.id)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
      >
        <EllipsisHorizontalIcon className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {/* Sort Options */}
            <button
              onClick={handleSortAscending}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <ChevronUpIcon className="h-4 w-4" />
              <span>Sort ascending</span>
            </button>
            <button
              onClick={handleSortDescending}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <ChevronDownIcon className="h-4 w-4" />
              <span>Sort descending</span>
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            {/* Move Options */}
            <button
              onClick={handleMoveLeft}
              disabled={position === 0}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronUpIcon className="h-4 w-4" />
              <span>Move left</span>
            </button>
            <button
              onClick={handleMoveRight}
              disabled={position === totalColumns - 1}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDownIcon className="h-4 w-4" />
              <span>Move right</span>
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            {/* Lock Option */}
            <button
              onClick={handleToggleLock}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              {column.locked ? (
                <LockClosedIcon className="h-4 w-4" />
              ) : (
                <LockOpenIcon className="h-4 w-4" />
              )}
              <span>{column.locked ? 'Unlock column' : 'Lock column'}</span>
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            {/* Add Column Options */}
            <button
              onClick={handleAddColumnBefore}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add column before</span>
            </button>
            <button
              onClick={handleAddColumnAfter}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add column after</span>
            </button>

            {/* Delete Option */}
            {column.removable && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleDeleteColumn}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete column</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
