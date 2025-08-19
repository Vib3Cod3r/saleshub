import { ChevronUpIcon, ChevronDownIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

interface SortableTableHeaderProps {
  label: string
  sortKey: string
  currentSortKey: string | null
  currentDirection: 'asc' | 'desc'
  onSort: (key: string) => void
  width?: string
  className?: string
}

export function SortableTableHeader({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  width = 'w-auto',
  className = ''
}: SortableTableHeaderProps) {
  const isActive = currentSortKey === sortKey
  const isAsc = isActive && currentDirection === 'asc'
  const isDesc = isActive && currentDirection === 'desc'

  return (
    <th className={`${width} px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      <button 
        className="flex items-center space-x-1 hover:text-gray-700"
        onClick={() => onSort(sortKey)}
      >
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUpIcon 
            className={`h-3 w-3 ${
              isAsc ? 'text-orange-500' : 'text-gray-400'
            }`} 
          />
          <ChevronDownIcon 
            className={`h-3 w-3 ${
              isDesc ? 'text-orange-500' : 'text-gray-400'
            }`} 
          />
        </div>
        <EllipsisHorizontalIcon className="h-4 w-4" />
      </button>
    </th>
  )
}
