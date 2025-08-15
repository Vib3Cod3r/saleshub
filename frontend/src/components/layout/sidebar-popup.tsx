'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface SidebarPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function SidebarPopup({ isOpen, onClose, title, children }: SidebarPopupProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel 
                  className="pointer-events-auto w-[264px] bg-white shadow-xl rounded-lg border border-gray-200"
                  style={{
                    position: 'fixed',
                    top: 'calc(56px + 32px)', // 56px header height + 32px gap
                    left: 'calc(64px + 8px)', // 64px sidebar width + 8px gap
                    height: 'calc(100vh - 56px - 32px - 160px)', // viewport height - header - top gap - bottom padding
                    zIndex: 60
                  }}
                >
                  <div className="flex h-full flex-col">
                    {/* Title aligned with content */}
                    <div className="px-3 pt-4 pb-4">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        {title}
                      </Dialog.Title>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
