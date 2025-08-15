'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import { 
  BookmarkIcon,
  Squares2X2Icon,
  MegaphoneIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Bookmarks', href: '/bookmarks', icon: BookmarkIcon },
  { name: 'Dashboard', href: '/', icon: Squares2X2Icon },
  { name: 'Marketing', href: '/marketing', icon: MegaphoneIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'E-commerce', href: '/ecommerce', icon: ShoppingCartIcon },
  { name: 'Payments', href: '/payments', icon: CreditCardIcon },
]

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-4 overflow-y-auto px-2 pb-3 bg-slate-800">
                  <div className="flex h-14 shrink-0 items-center justify-center">
                    {/* HubSpot-like logo */}
                    <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-sm"></div>
                    </div>
                  </div>
                  
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-2">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={cn(
                              pathname === item.href
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-slate-700',
                              'group flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-colors duration-200'
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  {/* Bottom arrow */}
                  <div className="flex justify-center">
                    <button className="flex items-center justify-center w-10 h-10 rounded-lg text-white hover:bg-slate-700 transition-colors duration-200">
                      <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-16 lg:flex-col">
        <div className="flex grow flex-col gap-y-4 overflow-y-auto px-2 pb-3 bg-slate-800">
          <div className="flex h-14 shrink-0 items-center justify-center">
            {/* HubSpot-like logo */}
            <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-white hover:bg-slate-700',
                      'group flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-colors duration-200'
                    )}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom arrow */}
          <div className="flex justify-center">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg text-white hover:bg-slate-700 transition-colors duration-200">
              <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
