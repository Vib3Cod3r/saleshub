import { MagnifyingGlassIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline'
import { LockClosedIcon } from '@heroicons/react/24/solid'

interface CrmPageLayoutProps {
  title: string
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder?: string
  onCreateClick: () => void
  createButtonText: string
  paginationInfo: {
    totalItems: number
    currentPage: number
    limit: number
  }
  children: React.ReactNode
  filters?: React.ReactNode

}

export function CrmPageLayout({
  title,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  onCreateClick,
  createButtonText,
  paginationInfo,
  children,
  filters,

}: CrmPageLayoutProps) {
  const { totalItems, currentPage, limit } = paginationInfo
  const startIndex = (currentPage - 1) * limit + 1
  const endIndex = Math.min(currentPage * limit, totalItems)

  return (
    <div className="bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              <LockClosedIcon className="h-4 w-4" />
              <span>Data Quality</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              <span>Actions</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Import
            </button>
            <button 
              onClick={onCreateClick}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
            >
              {createButtonText}
            </button>
          </div>
        </div>

        {/* Search, Filters, and Actions */}
        <div className="flex items-center justify-between mb-4">
          {/* Left side - Search and Filters */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Filters */}
            {filters && (
              <div className="flex items-center space-x-1">
                {filters}
                <PlusIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>

          {/* Right side - Records count and Actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {`${startIndex}-${endIndex} of ${totalItems} records`}
            </span>
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Export</button>
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Edit columns</button>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
