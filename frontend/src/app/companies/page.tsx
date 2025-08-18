'use client'

import { useEffect, useState } from 'react'
import { usePageRegistration } from '@/hooks/use-version-registry'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Database, Globe } from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: number
  name: string
  industry: string
  employees: number
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  // Register this page with the version registry
  const { registerThisPage, error } = usePageRegistration({
    id: 'companies-page',
    name: 'Companies Management',
    path: '/companies',
    version: '1.2.0',
    checksum: 'companies_page_v1_2_0_checksum',
    dependencies: [
      {
        id: 'sales-crm-db',
        type: 'database',
        version: '1.1.0',
        required: true,
        compatibility: 'minimum'
      },
      {
        id: 'companies-api',
        type: 'api',
        version: '1.2.0',
        required: true,
        compatibility: 'exact'
      }
    ],
    features: ['company-list', 'company-create', 'company-edit', 'company-delete', 'search', 'filtering', 'pagination'],
    status: 'active',
    metadata: {},
    compatibilityMatrix: {}
  })

  useEffect(() => {
    // Register the page when component mounts
    registerThisPage()
    
    // Simulate loading companies data
    setTimeout(() => {
      setCompanies([
        { id: 1, name: 'Acme Corp', industry: 'Technology', employees: 500 },
        { id: 2, name: 'Global Industries', industry: 'Manufacturing', employees: 1200 },
        { id: 3, name: 'Tech Solutions', industry: 'Software', employees: 300 }
      ])
      setLoading(false)
    }, 1000)
  }, [registerThisPage])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-gray-600 mt-2">Manage your company relationships</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/version-registry">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Version Registry
            </Button>
          </Link>
          <Button>
            Add Company
          </Button>
        </div>
      </div>

      {/* Version Registry Status */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-700 font-medium">Version Registry Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Page Information</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            This page is registered with the version registry system
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Page ID</p>
              <p className="text-sm">companies-page</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Version</p>
              <Badge variant="secondary">1.2.0</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Dependencies</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Database className="h-3 w-3" />
                <span>sales-crm-db@1.1.0</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>companies-api@1.2.0</span>
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Features</p>
            <div className="flex flex-wrap gap-1">
              {['company-list', 'company-create', 'company-edit', 'company-delete', 'search', 'filtering', 'pagination'].map(feature => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({companies.length})</CardTitle>
          <p className="text-sm text-gray-600">Your company relationships and contacts</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.map(company => (
              <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.industry}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{company.employees} employees</span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Version Registry Link */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              This page demonstrates integration with the comprehensive version registry system.
            </p>
            <Link href="/version-registry">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Open Version Registry Manager
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
