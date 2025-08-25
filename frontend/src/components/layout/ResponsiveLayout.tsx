'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Menu, X, Search, Bell, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mobile navigation items
  const mobileNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Contacts', href: '/contacts', icon: '👥' },
    { name: 'Companies', href: '/companies', icon: '🏢' },
    { name: 'Deals', href: '/deals', icon: '💰' },
    { name: 'Leads', href: '/leads', icon: '🎯' },
    { name: 'Tasks', href: '/tasks', icon: '✅' },
    { name: 'Reports', href: '/reports', icon: '📈' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">SalesHub</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <ConnectionStatus />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(true)}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="py-4">
          <div className="px-4">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation Menu */}
      <Modal open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <Modal.Content size="full" className="h-full">
          <Modal.Header>
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-semibold">Navigation</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </Modal.Header>
          <Modal.Body>
            <nav className="space-y-2">
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </a>
                )
              })}
            </nav>
            
            {/* User Profile Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 px-4 py-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    // Navigate to profile
                  }}
                >
                  Profile Settings
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    logout()
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      {/* Mobile Search Modal */}
      <Modal open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <Modal.Content size="lg">
          <Modal.Header>
            <span>Search</span>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search contacts, companies, deals..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">Add Contact</div>
                    <div className="text-sm text-gray-500">Create new contact</div>
                  </button>
                  <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">Add Company</div>
                    <div className="text-sm text-gray-500">Create new company</div>
                  </button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      {/* Mobile Notifications Modal */}
      <Modal open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <Modal.Content size="lg">
          <Modal.Header>
            <span>Notifications</span>
          </Modal.Header>
          <Modal.Body>
            <NotificationCenter />
          </Modal.Body>
        </Modal.Content>
      </Modal>

      {/* Mobile User Menu Modal */}
      <Modal open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
        <Modal.Content size="sm">
          <Modal.Header>
            <span>User Menu</span>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-2">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Profile Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Account Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Help & Support
              </button>
              <hr className="my-2" />
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                onClick={() => {
                  setIsUserMenuOpen(false)
                  logout()
                }}
              >
                Sign Out
              </button>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </div>
  )
}
