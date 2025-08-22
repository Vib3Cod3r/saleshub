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
      case 'CRM':
        return {
          title: 'CRM',
          sections: [
            {
              title: 'Core CRM',
              items: [
                { icon: UserGroupIcon, label: 'Contacts', action: 'link', href: '/crm/contacts' },
                { icon: UserGroupIcon, label: 'Companies', action: 'link', href: '/crm/companies' },
                { icon: UserGroupIcon, label: 'Leads', action: 'link', href: '/crm/leads' },
                { icon: ChartBarIcon, label: 'Deals', action: 'link', href: '/crm/deals' },
              ]
            },
            {
              title: 'Other',
              items: [
                { icon: DocumentTextIcon, label: 'Tasks', action: 'link', href: '/tasks' },
              ]
            }
          ]
        }
      case 'Marketing':
        return {
          title: 'Marketing',
          sections: [
            {
              title: '',
              items: [
                { icon: PlusIcon, label: 'Create Campaign', action: 'link', href: '/marketing/campaigns' },
                { icon: ChartBarIcon, label: 'View Analytics', action: 'link', href: '/marketing/analytics' },
                { icon: FunnelIcon, label: 'Lead Scoring', action: 'link', href: '/marketing/lead-scoring' },
                { icon: DocumentTextIcon, label: 'Email Templates', action: 'link', href: '/marketing/templates' },
                { icon: UserGroupIcon, label: 'Contact Lists', action: 'link', href: '/marketing/lists' },
                { icon: CogIcon, label: 'Automation', action: 'link', href: '/marketing/automation' },
              ]
            }
          ]
        }
      case 'Documents':
        return {
          title: 'Documents',
          sections: [
            {
              title: '',
              items: [
                { icon: PlusIcon, label: 'Upload File', action: 'link', href: '/documents/upload' },
                { icon: DocumentTextIcon, label: 'Recent Files', action: 'link', href: '/documents/recent' },
                { icon: StarIcon, label: 'Starred Files', action: 'link', href: '/documents/starred' },
                { icon: DocumentTextIcon, label: 'Contract Templates', action: 'link', href: '/documents/contracts' },
                { icon: DocumentTextIcon, label: 'Proposal Templates', action: 'link', href: '/documents/proposals' },
                { icon: DocumentTextIcon, label: 'Invoice Templates', action: 'link', href: '/documents/invoices' },
              ]
            }
          ]
        }
      case 'E-commerce':
        return {
          title: 'E-commerce',
          sections: [
            {
              title: '',
              items: [
                { icon: PlusIcon, label: 'Add Product', action: 'link', href: '/ecommerce/products' },
                { icon: ChartBarIcon, label: 'Product Analytics', action: 'link', href: '/ecommerce/analytics' },
                { icon: CogIcon, label: 'Inventory Management', action: 'link', href: '/ecommerce/inventory' },
                { icon: ClockIcon, label: 'Recent Orders', action: 'link', href: '/ecommerce/orders' },
                { icon: StarIcon, label: 'Pending Orders', action: 'link', href: '/ecommerce/pending' },
                { icon: ChartBarIcon, label: 'Sales Reports', action: 'link', href: '/ecommerce/reports' },
              ]
            }
          ]
        }
      case 'Payments':
        return {
          title: 'Payments',
          sections: [
            {
              title: '',
              items: [
                { icon: PlusIcon, label: 'New Payment', action: 'link', href: '/payments/new' },
                { icon: ClockIcon, label: 'Recent Transactions', action: 'link', href: '/payments/transactions' },
                { icon: ChartBarIcon, label: 'Payment Analytics', action: 'link', href: '/payments/analytics' },
                { icon: CogIcon, label: 'Payment Methods', action: 'link', href: '/payments/methods' },
                { icon: CogIcon, label: 'Billing Settings', action: 'link', href: '/payments/billing' },
                { icon: CogIcon, label: 'Tax Configuration', action: 'link', href: '/payments/tax' },
              ]
            }
          ]
        }
      case 'Bookmarks':
        return {
          title: 'Bookmarks',
          sections: [
            {
              title: '',
              items: [
                { icon: StarIcon, label: 'Frequently Used', action: 'link', href: '/bookmarks/frequent' },
                { icon: ClockIcon, label: 'Recently Viewed', action: 'link', href: '/bookmarks/recent' },
                { icon: PlusIcon, label: 'Add Bookmark', action: 'link', href: '/bookmarks/add' },
                { icon: UserGroupIcon, label: 'Contacts', action: 'link', href: '/bookmarks/contacts' },
                { icon: DocumentTextIcon, label: 'Documents', action: 'link', href: '/bookmarks/documents' },
                { icon: ChartBarIcon, label: 'Reports', action: 'link', href: '/bookmarks/reports' },
              ]
            }
          ]
        }
      default:
        return {
          title: type,
          sections: [
            {
              title: '',
              items: [
                { icon: PlusIcon, label: 'Create New', action: 'link', href: '/create' },
                { icon: PlusIcon, label: 'Search', action: 'link', href: '/search' },
                { icon: CogIcon, label: 'Settings', action: 'link', href: '/settings' },
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
          <div key={`section-${section.title || 'default'}-${sectionIndex.toString()}`} className="p-4 border-b border-gray-100 last:border-b-0">
            {section.title && (
              <h3 className={cn(
                "text-sm font-semibold text-gray-900 mb-3",
                section.title === 'CRM' && "font-bold text-base"
              )}>
                {section.title}
              </h3>
            )}
            <div className="space-y-[36px]">
              {section.items.map((item, itemIndex) => (
                item.action === 'link' ? (
                  <Link
                    key={`item-${item.label}-${item.href}-${itemIndex.toString()}`}
                    href={item.href}
                    onClick={onClose}
                    className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-50"
                  >
                    <span className="flex-1 text-left">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={`button-${item.label}-${item.action}-${itemIndex.toString()}`}
                    className={cn(
                      'w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200',
                      item.action === 'primary' 
                        ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' 
                        : item.action === 'secondary'
                        ? 'text-gray-700 hover:bg-gray-50'
                        : 'text-gray-500 hover:bg-gray-50'
                    )}
                  >
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

      {/* Footer removed for all popup menus */}
    </div>
  )
}
