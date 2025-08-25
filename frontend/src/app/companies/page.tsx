'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Plus, Search, Filter, Edit, Trash2, Users, Globe } from 'lucide-react'
import { CompanyForm } from '@/components/companies/CompanyForm'
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/api/useApi'
import { toast } from 'react-hot-toast'
import type { Company } from '@/types/crm'

export default function CompaniesPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>()
  
  // API hooks
  const { data: companies = [], isLoading: companiesLoading } = useCompanies({
    search: search || undefined,
  })
  
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const deleteCompany = useDeleteCompany()

  const handleAddCompany = () => {
    setSelectedCompany(undefined)
    setModalOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setModalOpen(true)
  }

  const handleDeleteCompany = async (company: Company) => {
    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await deleteCompany.mutateAsync(company.id)
        toast.success('Company deleted successfully')
      } catch (error) {
        toast.error('Failed to delete company')
      }
    }
  }

  const handleSubmit = async (data: Partial<Company>) => {
    try {
      if (selectedCompany) {
        // Update existing company
        await updateCompany.mutateAsync({
          id: selectedCompany.id,
          ...data,
        })
        toast.success('Company updated successfully')
      } else {
        // Create new company
        await createCompany.mutateAsync(data)
        toast.success('Company created successfully')
      }
      
      setModalOpen(false)
    } catch (error) {
      console.error('Error saving company:', error)
      toast.error(selectedCompany ? 'Failed to update company' : 'Failed to create company')
    }
  }

  const filteredCompanies = companies.filter((company: Company) =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.industry?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <Button leftIcon={<Plus />} onClick={handleAddCompany}>
          Add Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search />}
              />
            </div>
            <Button variant="outline" leftIcon={<Filter />}>
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Companies ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCompanies.map((company: Company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary-700">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{company.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {company.industry && (
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {company.industry}
                        </span>
                      )}
                      {company.website && (
                        <span className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          {company.website}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : company.status === 'prospect'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {company.status}
                      </span>
                    </div>
                    {company.address && (
                      <p className="text-xs text-gray-400 mt-1">
                        {[company.address.city, company.address.state, company.address.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditCompany(company)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteCompany(company)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <Modal.Content size="xl">
          <Modal.Header>
            {selectedCompany ? 'Edit Company' : 'Add New Company'}
          </Modal.Header>
          <Modal.Body>
            <CompanyForm
              company={selectedCompany}
              onSubmit={handleSubmit}
              onCancel={() => setModalOpen(false)}
              loading={createCompany.isPending || updateCompany.isPending}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </div>
  )
}
