'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { ErrorBoundary } from '../error-boundary'

interface MainContentProps {
  children: React.ReactNode
}

export function MainContent({ children }: MainContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't show header and sidebar for auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'

  // Prevent hydration mismatch by waiting for client-side mount
  if (!mounted) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </ErrorBoundary>
    )
  }

  if (isAuthPage) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-800">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          logoImage="/c74beb39e6a8fc1b9bd06592c750b4c9(1).png"
          logoAlt="SalesHub Logo"
        />
        
        <div className="lg:pl-16 flex flex-col h-screen">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <div className="flex-1 lg:rounded-tl-2xl bg-white overflow-auto">
            <main className="py-6">
              <div className="px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
