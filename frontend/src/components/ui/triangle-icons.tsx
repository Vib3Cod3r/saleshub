import React from 'react'

interface TriangleUpIconProps {
  className?: string
}

export function TriangleUpIcon({ className = "h-3 w-3" }: TriangleUpIconProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 4L20 16H4L12 4Z" />
    </svg>
  )
}

interface TriangleDownIconProps {
  className?: string
}

export function TriangleDownIcon({ className = "h-3 w-3" }: TriangleDownIconProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 20L4 8H20L12 20Z" />
    </svg>
  )
}
