import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../../contexts/AuthContext'
import ContactsPage from '../../../app/contacts/page'
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from '../../../hooks/api/useApi'
import { createMockContact, createMockContacts } from '../../../utils/test-data'

const mockContacts = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: { id: '1', name: 'Test Company 1' },
    tags: ['lead', 'vip'],
    status: 'active',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+0987654321',
    company: { id: '2', name: 'Test Company 2' },
    tags: ['customer'],
    status: 'active',
  },
]

describe('Contact Management Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  afterEach(() => {
    queryClient.clear()
    jest.clearAllMocks()
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    )
  }

  describe('Contact CRUD Operations', () => {
    it('should create, read, update, delete contact successfully', async () => {
      const mockCreateContact = jest.fn().mockResolvedValue({ id: '3', firstName: 'New', lastName: 'Contact' })
      const mockUpdateContact = jest.fn().mockResolvedValue({ id: '1', firstName: 'Updated', lastName: 'Contact' })
      const mockDeleteContact = jest.fn().mockResolvedValue({ success: true })

      ;(useContacts as jest.Mock).mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      })
      ;(useCreateContact as jest.Mock).mockReturnValue({
        mutate: mockCreateContact,
        isLoading: false,
        error: null,
      })
      ;(useUpdateContact as jest.Mock).mockReturnValue({
        mutate: mockUpdateContact,
        isLoading: false,
        error: null,
      })
      ;(useDeleteContact as jest.Mock).mockReturnValue({
        mutate: mockDeleteContact,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<ContactsPage />)

      // Test READ - should display contacts
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })

      // Test CREATE - open create modal
      const addButton = screen.getByRole('button', { name: /add contact/i })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/create contact/i)).toBeInTheDocument()
      })

      // Fill create form
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const emailInput = screen.getByLabelText(/email/i)

      fireEvent.change(firstNameInput, { target: { value: 'New' } })
      fireEvent.change(lastNameInput, { target: { value: 'Contact' } })
      fireEvent.change(emailInput, { target: { value: 'new.contact@example.com' } })

      // Submit create form
      const createButton = screen.getByRole('button', { name: /create/i })
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(mockCreateContact).toHaveBeenCalledWith({
          firstName: 'New',
          lastName: 'Contact',
          email: 'new.contact@example.com',
        })
      })

      // Test UPDATE - open edit modal
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/edit contact/i)).toBeInTheDocument()
      })

      // Update contact
      const updateFirstNameInput = screen.getByDisplayValue('John')
      fireEvent.change(updateFirstNameInput, { target: { value: 'Updated' } })

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateContact).toHaveBeenCalledWith({
          id: '1',
          firstName: 'Updated',
          lastName: 'Doe',
        })
      })

      // Test DELETE
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      fireEvent.click(deleteButtons[0])

      // Confirm deletion
      const confirmDeleteButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmDeleteButton)

      await waitFor(() => {
        expect(mockDeleteContact).toHaveBeenCalledWith('1')
      })
    })
  })

  describe('Contact Search and Filtering', () => {
    it('should handle contact search functionality', async () => {
      ;(useContacts as jest.Mock).mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<ContactsPage />)

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search contacts/i)
      fireEvent.change(searchInput, { target: { value: 'John' } })

      // Should filter results
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    it('should handle advanced filtering', async () => {
      ;(useContacts as jest.Mock).mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<ContactsPage />)

      // Open advanced filters
      const filterButton = screen.getByRole('button', { name: /filters/i })
      fireEvent.click(filterButton)

      await waitFor(() => {
        expect(screen.getByText(/advanced filters/i)).toBeInTheDocument()
      })

      // Filter by company
      const companySelect = screen.getByLabelText(/company/i)
      fireEvent.change(companySelect, { target: { value: '1' } })

      // Filter by status
      const statusSelect = screen.getByLabelText(/status/i)
      fireEvent.change(statusSelect, { target: { value: 'active' } })

      // Apply filters
      const applyButton = screen.getByRole('button', { name: /apply/i })
      fireEvent.click(applyButton)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Contact Relationships', () => {
    it('should manage contact-company relationships', async () => {
      ;(useContacts as jest.Mock).mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<ContactsPage />)

      // Open create contact modal
      const addButton = screen.getByRole('button', { name: /add contact/i })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/create contact/i)).toBeInTheDocument()
      })

      // Select company
      const companySelect = screen.getByLabelText(/company/i)
      fireEvent.change(companySelect, { target: { value: '1' } })

      // Should show selected company
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company 1')).toBeInTheDocument()
      })
    })

    it('should manage contact tags', async () => {
      ;(useContacts as jest.Mock).mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<ContactsPage />)

      // Open create contact modal
      const addButton = screen.getByRole('button', { name: /add contact/i })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/create contact/i)).toBeInTheDocument()
      })

      // Add tags
      const tagsInput = screen.getByLabelText(/tags/i)
      fireEvent.change(tagsInput, { target: { value: 'new-tag' } })
      fireEvent.keyDown(tagsInput, { key: 'Enter' })

      // Should show added tag
      await waitFor(() => {
        expect(screen.getByText('new-tag')).toBeInTheDocument()
      })
    })
  })

  describe('Data Export', () => {
    it('should export contact data successfully', async () => {
      ;(useContacts as jest.Mock).mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<ContactsPage />)

      // Open export modal
      const exportButton = screen.getByRole('button', { name: /export/i })
      fireEvent.click(exportButton)

      await waitFor(() => {
        expect(screen.getByText(/export data/i)).toBeInTheDocument()
      })

      // Select export format
      const csvOption = screen.getByLabelText(/csv/i)
      fireEvent.click(csvOption)

      // Select fields to export
      const nameCheckbox = screen.getByLabelText(/name/i)
      const emailCheckbox = screen.getByLabelText(/email/i)
      fireEvent.click(nameCheckbox)
      fireEvent.click(emailCheckbox)

      // Export data
      const exportDataButton = screen.getByRole('button', { name: /export data/i })
      fireEvent.click(exportDataButton)

      // Should trigger download
      await waitFor(() => {
        expect(screen.getByText(/export completed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      ;(useContacts as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch contacts'),
      })

      renderWithProviders(<ContactsPage />)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to fetch contacts/i)).toBeInTheDocument()
      })

      // Should show retry button
      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should handle validation errors', async () => {
      const mockCreateContact = jest.fn().mockRejectedValue(new Error('Validation failed'))
      ;(useContacts as jest.Mock).mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      })
      ;(useCreateContact as jest.Mock).mockReturnValue({
        mutate: mockCreateContact,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<ContactsPage />)

      // Open create modal
      const addButton = screen.getByRole('button', { name: /add contact/i })
      fireEvent.click(addButton)

      // Submit without required fields
      const createButton = screen.getByRole('button', { name: /create/i })
      fireEvent.click(createButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading states during operations', async () => {
      ;(useContacts as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      renderWithProviders(<ContactsPage />)

      // Should show loading spinner
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should show loading state during contact creation', async () => {
      ;(useContacts as jest.Mock).mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      })
      ;(useCreateContact as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isLoading: true,
        error: null,
      })

      renderWithProviders(<ContactsPage />)

      // Open create modal
      const addButton = screen.getByRole('button', { name: /add contact/i })
      fireEvent.click(addButton)

      // Should show loading state in create button
      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create/i })
        expect(createButton).toBeDisabled()
        expect(createButton).toHaveTextContent(/creating/i)
      })
    })
  })
})
