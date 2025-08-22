interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalItems, 
  onPageChange, 
  onPageSizeChange, 
  pageSizeOptions = [10, 25, 50, 100],
  className = '' 
}: PaginationProps) {
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const generatePageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 10
    const ellipsisThreshold = 5
    
    // If total pages is 10 or less, show all pages
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // For more than 10 pages, show smart pagination
      if (currentPage <= ellipsisThreshold) {
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
    <div className={`flex items-center justify-between ${className}`}>
      {/* Page Size Control */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Show:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span className="text-sm text-gray-700">
          of {totalItems} items
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button 
          className={`text-sm font-medium px-3 py-1 rounded ${
            hasPrevPage 
              ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasPrevPage}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        
        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {generatePageNumbers().map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={`page-${pageNum}`}
                className={`px-2 py-1 text-sm font-medium rounded ${
                  pageNum === currentPage
                    ? 'bg-orange-500 text-white' // Current page - orange background
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' // Other pages
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
          className={`text-sm font-medium px-3 py-1 rounded ${
            hasNextPage 
              ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
