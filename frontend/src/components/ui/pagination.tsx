import { CRM_CONSTANTS } from '@/lib/utils'

interface PaginationInfo {
  totalItems: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface PaginationProps {
  paginationInfo: PaginationInfo
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ paginationInfo, onPageChange, className = '' }: PaginationProps) {
  const { totalPages, currentPage, hasNextPage, hasPrevPage } = paginationInfo

  const generatePageNumbers = () => {
    const pages: (number | string)[] = []
    
    // If total pages is 10 or less, show all pages
    if (totalPages <= CRM_CONSTANTS.PAGINATION.MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // For more than 10 pages, show smart pagination
      if (currentPage <= CRM_CONSTANTS.PAGINATION.ELLIPSIS_THRESHOLD) {
        // Show first 7 pages + ellipsis + last page
        for (let i = 1; i <= 7; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 4) {
        // Show first page + ellipsis + last 7 pages
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 6; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show first page + ellipsis + current page and neighbors + ellipsis + last page
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-center space-x-2 mt-12 pt-6 ${className}`}>
      {/* Previous Button */}
      <button 
        className={`text-sm font-medium ${
          hasPrevPage 
            ? 'text-blue-600 hover:text-blue-800' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        disabled={!hasPrevPage}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      
      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {generatePageNumbers().map((pageNum) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${Math.random().toString(36).substr(2, 9)}`} className="px-2 py-1 text-sm text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={`page-${pageNum}`}
              className={`px-2 py-1 text-sm font-medium rounded ${
                pageNum === currentPage
                  ? 'text-black font-semibold' // Current page - black and bold
                  : 'text-blue-600 hover:text-blue-800' // Other pages - blue
              }`}
              onClick={() => onPageChange(pageNum as number)}
            >
              {pageNum}
            </button>
          )
        ))}
      </div>
      
      {/* Next Button */}
      <button 
        className={`text-sm font-medium ${
          hasNextPage 
            ? 'text-blue-600 hover:text-blue-800' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  )
}
