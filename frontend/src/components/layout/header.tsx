'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon, 
  BellIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  PlusIcon,
  StarIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="text-white shadow-lg pr-9" style={{ backgroundColor: '#402D50' }}>
      <div className="flex h-14 items-center justify-between px-4 lg:px-0">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <button
            type="button"
            className="text-white hover:text-gray-300 lg:hidden"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>
          
          {/* Search and Plus button - positioned at the very left edge on desktop */}
          <div className="flex items-center space-x-3 lg:ml-0 lg:pl-0">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-80 rounded-lg border-0 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:outline-none text-sm leading-5 bg-slate-700"
                placeholder="Search SalesHub"
              />
            </div>
            
            <button className="p-1.5 text-white hover:text-gray-300 rounded-full hover:bg-slate-700 transition-colors duration-200">
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Icons */}
          <div className="flex items-center space-x-8">
            <button
              type="button"
              className="text-white hover:bg-slate-700 flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200"
            >
              <span className="sr-only">Phone</span>
              <PhoneIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            <button
              type="button"
              className="text-white hover:bg-slate-700 flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200"
            >
              <span className="sr-only">Store</span>
              <BuildingStorefrontIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            <button
              type="button"
              className="text-white hover:bg-slate-700 flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200"
            >
              <span className="sr-only">Help</span>
              <QuestionMarkCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            <button
              type="button"
              className="text-white hover:bg-slate-700 flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200"
            >
              <span className="sr-only">Settings</span>
              <Cog6ToothIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            <button
              type="button"
              className="relative text-white hover:bg-slate-700 flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200"
            >
              <span className="sr-only">Notifications</span>
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-1 right-1 h-4 w-4 text-xs rounded-full flex items-center justify-center" style={{ backgroundColor: '#25E04E', color: '#402D50' }}>
                1
              </span>
            </button>
          </div>

          {/* Copilot */}
          <div className="flex items-center space-x-2">
            <StarIcon className="h-4 w-4" style={{ color: '#25E04E' }} aria-hidden="true" />
            <span className="text-sm font-medium">Copilot</span>
          </div>

          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200" style={{ '--tw-ring-offset-color': '#1e293b' } as React.CSSProperties}>
              <span className="sr-only">Open user menu</span>
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium">{user?.email || 'fanjango.com.hk'}</span>
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200">
                <Menu.Item>
                  {() => (
                    <div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100">
                      {user?.firstName} {user?.lastName}
                    </div>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={cn(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block w-full px-3 py-2 text-left text-sm transition-colors duration-200'
                      )}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  )
}
