'use client'

import { 
  PlusIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PopupContentProps {
  type: string
  onClose?: () => void
}

export function PopupContent({ type, onClose }: PopupContentProps) {
  const getContent = () => {
    switch (type) {
      case 'Dashboard':
        return {
          title: 'Dashboard',
          sections: [
            {
              title: 'CRM',
              items: [
                { icon: UserGroupIcon, label: 'Leads', action: 'link', href: '/leads' },
                { icon: UserGroupIcon, label: 'Contacts', action: 'link', href: '/contacts' },
                { icon: UserGroupIcon, label: 'Companies', action: 'link', href: '/companies' },
                { icon: DocumentTextIcon, label: 'Tasks', action: 'link', href: '/tasks' },
                { icon: ChartBarIcon, label: 'Deals', action: 'link', href: '/deals' },
              ]
            }
          ]
        }
      case 'Marketing':
        return {
          title: 'Marketing',
          sections: [
            {
              title: 'Campaigns',
              items: [
                { icon: PlusIcon, label: 'Create Campaign', action: 'primary' },
                { icon: ChartBarIcon, label: 'View Analytics', action: 'secondary' },
                { icon: FunnelIcon, label: 'Lead Scoring', action: 'secondary' },
              ]
            },
            {
              title: 'Tools',
              items: [
                { icon: DocumentTextIcon, label: 'Email Templates', action: 'secondary' },
                { icon: UserGroupIcon, label: 'Contact Lists', action: 'secondary' },
                { icon: CogIcon, label: 'Automation', action: 'secondary' },
              ]
            }
          ]
        }
      case 'Documents':
        return {
          title: 'Documents',
          sections: [
            {
              title: 'Files',
              items: [
                { icon: PlusIcon, label: 'Upload File', action: 'primary' },
                { icon: DocumentTextIcon, label: 'Recent Files', action: 'secondary' },
                { icon: StarIcon, label: 'Starred Files', action: 'secondary' },
              ]
            },
            {
              title: 'Templates',
              items: [
                { icon: DocumentTextIcon, label: 'Contract Templates', action: 'secondary' },
                { icon: DocumentTextIcon, label: 'Proposal Templates', action: 'secondary' },
                { icon: DocumentTextIcon, label: 'Invoice Templates', action: 'secondary' },
              ]
            }
          ]
        }
      case 'E-commerce':
        return {
          title: 'E-commerce',
          sections: [
            {
              title: 'Products',
              items: [
                { icon: PlusIcon, label: 'Add Product', action: 'primary' },
                { icon: ChartBarIcon, label: 'Product Analytics', action: 'secondary' },
                { icon: CogIcon, label: 'Inventory Management', action: 'secondary' },
              ]
            },
            {
              title: 'Orders',
              items: [
                { icon: ClockIcon, label: 'Recent Orders', action: 'secondary' },
                { icon: StarIcon, label: 'Pending Orders', action: 'secondary' },
                { icon: ChartBarIcon, label: 'Sales Reports', action: 'secondary' },
              ]
            }
          ]
        }
      case 'Payments':
        return {
          title: 'Payments',
          sections: [
            {
              title: 'Transactions',
              items: [
                { icon: PlusIcon, label: 'New Payment', action: 'primary' },
                { icon: ClockIcon, label: 'Recent Transactions', action: 'secondary' },
                { icon: ChartBarIcon, label: 'Payment Analytics', action: 'secondary' },
              ]
            },
            {
              title: 'Settings',
              items: [
                { icon: CogIcon, label: 'Payment Methods', action: 'secondary' },
                { icon: CogIcon, label: 'Billing Settings', action: 'secondary' },
                { icon: CogIcon, label: 'Tax Configuration', action: 'secondary' },
              ]
            }
          ]
        }
      case 'Bookmarks':
        return {
          title: 'Bookmarks',
          sections: [
            {
              title: 'Quick Access',
              items: [
                { icon: StarIcon, label: 'Frequently Used', action: 'secondary' },
                { icon: ClockIcon, label: 'Recently Viewed', action: 'secondary' },
                { icon: PlusIcon, label: 'Add Bookmark', action: 'primary' },
              ]
            },
            {
              title: 'Categories',
              items: [
                { icon: UserGroupIcon, label: 'Contacts', action: 'secondary' },
                { icon: DocumentTextIcon, label: 'Documents', action: 'secondary' },
                { icon: ChartBarIcon, label: 'Reports', action: 'secondary' },
              ]
            }
          ]
        }
      default:
        return {
          title: type,
          sections: [
            {
              title: 'Actions',
              items: [
                { icon: PlusIcon, label: 'Create New', action: 'primary' },
                { icon: PlusIcon, label: 'Search', action: 'secondary' },
                { icon: CogIcon, label: 'Settings', action: 'secondary' },
              ]
            }
          ]
        }
    }
  }

  const content = getContent()

  return (
    <div className="h-full flex flex-col">
      {/* Content Sections */}
      <div className="flex-1 overflow-y-auto">
        {content.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="p-4 border-b border-gray-100 last:border-b-0">
            <h3 className={cn(
              "text-sm font-semibold text-gray-900 mb-3",
              section.title === 'CRM' && "font-bold text-base"
            )}>
              {section.title}
            </h3>
            <div className="space-y-[36px]">
              {section.items.map((item, itemIndex) => (
                item.action === 'link' ? (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    onClick={onClose}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-50"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={itemIndex}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors duration-200',
                      item.action === 'primary' 
                        ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' 
                        : item.action === 'secondary'
                        ? 'text-gray-700 hover:bg-gray-50'
                        : 'text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.action === 'primary' && (
                      <EllipsisHorizontalIcon className="h-4 w-4 text-orange-500" aria-hidden="true" />
                    )}
                  </button>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Quick access to {content.title.toLowerCase()}</span>
          <button className="text-orange-600 hover:text-orange-700 font-medium">
            View All
          </button>
        </div>
      </div>
    </div>
  )
}
