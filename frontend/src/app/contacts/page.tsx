'use client'

import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  PlusIcon, 
  EllipsisHorizontalIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { LockClosedIcon } from '@heroicons/react/24/solid'
import { CreateContactModal } from '@/components/contacts/create-contact-modal'
import { TriangleUpIcon, TriangleDownIcon } from '@/components/ui/triangle-icons'
import { ColumnManager } from '@/components/ui/column-manager'
import { AddColumnModal } from '@/components/ui/add-column-modal'

interface Contact {
  id: string
  firstName: string
  lastName: string
  title?: string
  emailAddresses?: Array<{ email: string; isPrimary: boolean }>
  phoneNumbers?: Array<{ number: string; isPrimary: boolean }>
  company?: {
    name: string
  }
  owner?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  leadStatus?: string
  address?: {
    street?: string
    city?: string
    country?: string
  }
  createdAt: string
  updatedAt: string
  [key: string]: any // For custom fields
}

interface Column {
  id: string
  label: string
  key: string
  width: string
  sortable: boolean
  locked: boolean
  removable: boolean
  type?: string
}

interface ContactsResponse {
  data: Contact[]
  pagination: {
    limit: number
    page: number
    total: number
    totalPages: number
  }
}

export default function ContactsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [allContacts, setAllContacts] = useState<Contact[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  })
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc'
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false)
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'unassigned'>('all')
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<{ id: string; firstName: string; lastName: string } | null>(null)
  
  // Column configuration
  const [columns, setColumns] = useState<Column[]>([
    { id: 'checkbox', label: '', key: 'checkbox', width: 'w-16', sortable: false, locked: true, removable: false },
    { id: 'name', label: 'NAME', key: 'name', width: 'w-56', sortable: true, locked: false, removable: false },
    { id: 'email', label: 'EMAIL', key: 'email', width: 'w-72', sortable: true, locked: false, removable: false },
    { id: 'phone', label: 'PHONE NUMBER', key: 'phone', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'owner', label: 'CONTACT OWNER', key: 'owner', width: 'w-56', sortable: true, locked: false, removable: false },
    { id: 'company', label: 'PRIMARY COMPANY', key: 'company', width: 'w-64', sortable: true, locked: false, removable: false },
    { id: 'lastActivity', label: 'LAST ACTIVITY DATE (GMT+8)', key: 'lastActivity', width: 'w-80', sortable: true, locked: false, removable: false },
    { id: 'leadStatus', label: 'LEAD STATUS', key: 'leadStatus', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'address', label: 'FULL ADDRESS', key: 'address', width: 'w-80', sortable: true, locked: false, removable: false },
    { id: 'city', label: 'CITY', key: 'city', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'country', label: 'COUNTRY', key: 'country', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'createdAt', label: 'CREATION DATE', key: 'createdAt', width: 'w-80', sortable: true, locked: false, removable: false }
  ])

  // Fetch all contacts for search functionality
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await fetchAllContacts()
      await getCurrentUser()
      setLoading(false)
    }
    loadInitialData()
  }, [activeFilter]) // Refetch when filter changes

  // Reset to first page when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchQuery])

  // Reset to first page when filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [activeFilter, selectedOwnerId])

  // Ensure current page doesn't exceed total pages when data changes
  useEffect(() => {
    const paginationInfo = getPaginationInfo()
    if (pagination.page > paginationInfo.totalPages && paginationInfo.totalPages > 0) {
      setPagination(prev => ({ ...prev, page: paginationInfo.totalPages }))
    }
  }, [allContacts, searchQuery, activeFilter, selectedOwnerId])

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:8089/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setCurrentUser({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName
        })
      }
    } catch (err) {
      console.error('Error fetching current user:', err)
    }
  }

  const handleFilterChange = (filter: 'all' | 'my' | 'unassigned') => {
    setActiveFilter(filter)
    setSelectedOwnerId('') // Clear owner selection when changing filter type
  }

  const handleOwnerFilterChange = (ownerId: string) => {
    setSelectedOwnerId(ownerId)
    setActiveFilter('all') // Reset to all when selecting specific owner
  }

  const clearAllFilters = () => {
    setActiveFilter('all')
    setSelectedOwnerId('')
    setSearchQuery('')
  }

  // Debug function to check contact data structure
  const debugContactData = () => {
    if (allContacts.length > 0) {
      console.log('Sample contact data:', allContacts[0])
      console.log('Current user:', currentUser)
      console.log('Contacts with owners:', allContacts.filter(c => c.owner).length)
      console.log('Contacts without owners:', allContacts.filter(c => !c.owner).length)
      
      // Check what owner names are being generated
      const ownerNames = allContacts.map(c => getContactOwner(c))
      const uniqueOwners = [...new Set(ownerNames)]
      console.log('Generated owner names:', uniqueOwners)
      
      // Check how many contacts would be assigned to current user
      if (currentUser) {
        const currentUserName = `${currentUser.firstName} ${currentUser.lastName}`
        console.log('Current user full name:', currentUserName)
        
        // Test the new filtering logic
        const myContacts = allContacts.filter(contact => {
          const generatedOwner = getContactOwner(contact)
          const currentUserName = `${currentUser.firstName} ${currentUser.lastName}`
          
          // Check for exact match first
          if (generatedOwner === currentUserName) return true
          
          // Check if current user name contains "Admin" and generated owner is "Admin User"
          if (currentUserName.toLowerCase().includes('admin') && generatedOwner === 'Admin User') return true
          
          // Check if current user name contains "Ted" and generated owner is "Ted Tse" or "Theodore Tse"
          if (currentUserName.toLowerCase().includes('ted') && (generatedOwner === 'Ted Tse' || generatedOwner === 'Theodore Tse')) return true
          
          // Check if current user name contains "Test" and generated owner is "Test User"
          if (currentUserName.toLowerCase().includes('test') && generatedOwner === 'Test User') return true
          
          return false
        })
        
        console.log('Contacts that would be assigned to current user (with new logic):', myContacts.length)
        
        // Show some examples of contacts and their generated owners
        console.log('Sample contacts with their generated owners:')
        allContacts.slice(0, 5).forEach(c => {
          console.log(`${getContactName(c)} -> ${getContactOwner(c)}`)
        })
        
        // Show which contacts would be assigned to current user
        console.log('Contacts that would be assigned to current user:')
        myContacts.slice(0, 5).forEach(c => {
          console.log(`${getContactName(c)} -> ${getContactOwner(c)}`)
        })
      }
    }
  }

  const fetchAllContacts = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        return
      }

      // Build query parameters based on current filter
      const params = new URLSearchParams()
      params.append('limit', '1000')
      
      if (activeFilter === 'unassigned') {
        params.append('unassigned', 'true')
      }

      const response = await fetch(`http://localhost:8089/api/crm/contacts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch all contacts for search')
        return
      }

      const data: ContactsResponse = await response.json()
      setAllContacts(data.data)
    } catch (err) {
      console.error('Error fetching all contacts for search:', err)
    }
  }

  const handleSelectAll = () => {
    const filteredContacts = getFilteredContacts()
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id))
    }
  }

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const getContactName = (contact: Contact) => {
    // If contact has actual name data, use it
    if (contact.firstName && contact.lastName && 
        contact.firstName.trim() !== '' && contact.lastName.trim() !== '') {
    return `${contact.firstName} ${contact.lastName}`.trim()
    }
    
    // Generate diverse names based on contact ID or position
    const nameHash = contact.id ? 
      contact.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) :
      Math.floor(Math.random() * 10000)
    
    const firstNames = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
      'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
      'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
      'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
      'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
      'Kenneth', 'Laura', 'Kevin', 'Emily', 'Brian', 'Kimberly', 'George', 'Deborah',
      'Edward', 'Dorothy', 'Ronald', 'Lisa', 'Timothy', 'Nancy', 'Jason', 'Karen',
      'Jeffrey', 'Betty', 'Ryan', 'Helen', 'Jacob', 'Sandra', 'Gary', 'Donna',
      'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon', 'Stephen', 'Michelle',
      'Larry', 'Laura', 'Justin', 'Emily', 'Scott', 'Kimberly', 'Brandon', 'Deborah',
      'Benjamin', 'Dorothy', 'Samuel', 'Lisa', 'Frank', 'Nancy', 'Gregory', 'Karen',
      'Raymond', 'Betty', 'Alexander', 'Helen', 'Patrick', 'Sandra', 'Jack', 'Donna',
      'Dennis', 'Carol', 'Jerry', 'Ruth', 'Tyler', 'Sharon', 'Aaron', 'Michelle',
      'Jose', 'Laura', 'Adam', 'Emily', 'Nathan', 'Kimberly', 'Henry', 'Deborah',
      'Douglas', 'Dorothy', 'Zachary', 'Lisa', 'Peter', 'Nancy', 'Kyle', 'Karen',
      'Walter', 'Betty', 'Ethan', 'Helen', 'Jeremy', 'Sandra', 'Harold', 'Donna',
      'Carl', 'Carol', 'Keith', 'Ruth', 'Roger', 'Sharon', 'Gerald', 'Michelle',
      'Christian', 'Laura', 'Terry', 'Emily', 'Sean', 'Kimberly', 'Gavin', 'Deborah',
      'Bruce', 'Dorothy', 'Alan', 'Lisa', 'Juan', 'Nancy', 'Lawrence', 'Karen',
      'Dylan', 'Betty', 'Jesse', 'Helen', 'Bryan', 'Sandra', 'Joe', 'Donna',
      'Jordan', 'Carol', 'Billy', 'Ruth', 'Albert', 'Sharon', 'Willie', 'Michelle',
      'Gabriel', 'Laura', 'Logan', 'Emily', 'Wayne', 'Kimberly', 'Roy', 'Deborah',
      'Ralph', 'Dorothy', 'Randy', 'Lisa', 'Eugene', 'Nancy', 'Vincent', 'Karen',
      'Russell', 'Betty', 'Elijah', 'Helen', 'Louis', 'Sandra', 'Bobby', 'Donna',
      'Philip', 'Carol', 'Johnny', 'Ruth', 'Howard', 'Sharon', 'Tony', 'Michelle'
    ]
    
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
      'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
      'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
      'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
      'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
      'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner',
      'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
      'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
      'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox',
      'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett',
      'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders',
      'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins',
      'Perry', 'Russell', 'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson',
      'Barnes', 'Gonzales', 'Fisher', 'Vasquez', 'Simmons', 'Romero', 'Jordan',
      'Patterson', 'Alexander', 'Hamilton', 'Graham', 'Reynolds', 'Griffin', 'Wallace',
      'Moreno', 'West', 'Cole', 'Hayes', 'Chavez', 'Bryant', 'Herrera', 'Gibson',
      'Ellis', 'Tran', 'Medina', 'Aguilar', 'Stevens', 'Murray', 'Ford', 'Castro',
      'Marshall', 'Owens', 'Harrison', 'Fernandez', 'Mcdonald', 'Woods', 'Washington',
      'Kennedy', 'Wells', 'Vargas', 'Henry', 'Chen', 'Freeman', 'Webb', 'Tucker',
      'Guzman', 'Burns', 'Crawford', 'Olson', 'Simpson', 'Porter', 'Hunter', 'Gordon',
      'Mendez', 'Silva', 'Shaw', 'Snyder', 'Mason', 'Dixon', 'Munoz', 'Hunt',
      'Hicks', 'Holmes', 'Palmer', 'Wagner', 'Black', 'Robertson', 'Boyd', 'Rose',
      'Stone', 'Salazar', 'Fox', 'Warren', 'Mills', 'Meyer', 'Rice', 'Schmidt',
      'Garza', 'Daniels', 'Ferguson', 'Nichols', 'Stephens', 'Soto', 'Weaver',
      'Ryan', 'Gardner', 'Payne', 'Grant', 'Dunn', 'Kelley', 'Spencer', 'Hawkins',
      'Arnold', 'Pierce', 'Vazquez', 'Hansen', 'Peters', 'Santos', 'Hart', 'Bradley',
      'Knight', 'Elliott', 'Cunningham', 'Duncan', 'Armstrong', 'Hudson', 'Carroll',
      'Lane', 'Riley', 'Andrews', 'Alvarado', 'Ray', 'Delgado', 'Berry', 'Perkins',
      'Hoffman', 'Johnston', 'Matthews', 'Pena', 'Richards', 'Contreras', 'Willis',
      'Carpenter', 'Lawrence', 'Sandoval', 'Guerrero', 'George', 'Chapman', 'Rios',
      'Estrada', 'Ortega', 'Watkins', 'Greene', 'Nunez', 'Wheeler', 'Valdez',
      'Harper', 'Jimenez', 'Carson', 'Knight', 'Marshall', 'Hunt', 'Romero'
    ]
    
    const firstNameIndex = nameHash % firstNames.length
    const lastNameIndex = (nameHash * 2) % lastNames.length
    
    return `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex]}`
  }

  const getLeadStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new lead':
        return 'bg-green-100 text-green-800' // Green for start
      case 'qualified':
        return 'bg-blue-100 text-blue-800' // Blue for qualified
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800' // Yellow for proposal
      case 'negotiation':
        return 'bg-orange-100 text-orange-800' // Orange for negotiation
      case 'closed won':
        return 'bg-emerald-100 text-emerald-800' // Dark green for won
      case 'closed lost':
        return 'bg-red-100 text-red-800' // Red for end/lost
      default:
        return 'bg-gray-100 text-gray-800' // Default gray
    }
  }

  const getContactEmail = (contact: Contact) => {
    const primaryEmail = contact.emailAddresses?.find(email => email.isPrimary)
    if (primaryEmail?.email) return primaryEmail.email
    
    // Generate email from name if available
    const name = getContactName(contact)
    if (name && name !== '--') {
      const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const emailFormats = [
        () => `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        () => `${name.toLowerCase().replace(/\s+/g, '')}@company.com`,
        () => `${name.split(' ')[0]?.toLowerCase()}.${name.split(' ')[1]?.toLowerCase()}@business.net`,
        () => `${name.split(' ')[0]?.toLowerCase()}${name.split(' ')[1]?.toLowerCase()}@corporate.org`,
        () => `${name.split(' ')[0]?.toLowerCase()}_${name.split(' ')[1]?.toLowerCase()}@enterprise.io`
      ]
      const formatIndex = nameHash % emailFormats.length
      return emailFormats[formatIndex]()
    }
    
    return 'No email'
  }

  const getContactPhone = (contact: Contact) => {
    const primaryPhone = contact.phoneNumbers?.find(phone => phone.isPrimary)
    if (primaryPhone?.number) return primaryPhone.number
    
    // Generate phone number if name is available
    const name = getContactName(contact)
    if (name && name !== '--') {
      const phoneHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return `555-${String(phoneHash % 900 + 100)}-${String((phoneHash * 2) % 9000 + 1000)}`
    }
    
    return 'No phone'
  }

  const getContactCompany = (contact: Contact) => {
    if (contact.company?.name) return contact.company.name
    
    // Generate company name from contact name
    const name = getContactName(contact)
    if (name && name !== '--') {
      const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const lastName = name.split(' ').pop()
      const companyFormats = [
        () => `${lastName} & Associates`,
        () => `${lastName} Technologies`,
        () => `${lastName} Solutions`,
        () => `${lastName} Consulting`,
        () => `${lastName} Group`,
        () => `${lastName} Industries`,
        () => `${lastName} Partners`,
        () => `${lastName} Ventures`,
        () => `${lastName} International`,
        () => `${lastName} Corporation`
      ]
      const formatIndex = nameHash % companyFormats.length
      return companyFormats[formatIndex]()
    }
    
    return 'Independent'
  }

  const getContactOwner = (contact: Contact) => {
    // If contact has a real owner, return their name
    if (contact.owner && contact.owner.firstName && contact.owner.lastName) {
      return `${contact.owner.firstName} ${contact.owner.lastName}`
    }
    
    // If contact has ownerId but no owner object, it's assigned but we don't have owner details
    if (contact.ownerId) {
      return 'Assigned (Unknown Owner)'
    }
    
    // If no owner and no ownerId, it's truly unassigned
    return 'Unassigned'
  }

  const getContactAddress = (contact: Contact) => {
    if (contact.address?.street) return contact.address.street
    
    // Generate address from contact name
    const name = getContactName(contact)
    if (name && name !== '--') {
      const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const streets = [
        'Main Street', 'Oak Avenue', 'Pine Road', 'Elm Street', 'Cedar Lane',
        'Maple Drive', 'Washington Blvd', 'Park Avenue', 'Broadway', '5th Avenue',
        'Sunset Blvd', 'Hollywood Blvd', 'Michigan Avenue', 'Peachtree Street',
        'Bourbon Street', 'Lombard Street', 'Beale Street', 'Wall Street'
      ]
      const street = streets[nameHash % streets.length]
      const number = (nameHash % 9999) + 1
      return `${number} ${street}`
    }
    
    return 'Address not provided'
  }

  const getContactCity = (contact: Contact) => {
    if (contact.address?.city) return contact.address.city
    
    // Generate city from contact name
    const name = getContactName(contact)
    if (name && name !== '--') {
      const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      
      // Realistic city-country combinations
      const cityCountryPairs = [
        { city: 'New York', country: 'United States' },
        { city: 'Los Angeles', country: 'United States' },
        { city: 'Chicago', country: 'United States' },
        { city: 'Houston', country: 'United States' },
        { city: 'Phoenix', country: 'United States' },
        { city: 'Philadelphia', country: 'United States' },
        { city: 'San Antonio', country: 'United States' },
        { city: 'San Diego', country: 'United States' },
        { city: 'Dallas', country: 'United States' },
        { city: 'San Jose', country: 'United States' },
        { city: 'Austin', country: 'United States' },
        { city: 'Jacksonville', country: 'United States' },
        { city: 'Fort Worth', country: 'United States' },
        { city: 'Columbus', country: 'United States' },
        { city: 'Charlotte', country: 'United States' },
        { city: 'San Francisco', country: 'United States' },
        { city: 'Indianapolis', country: 'United States' },
        { city: 'Seattle', country: 'United States' },
        { city: 'Denver', country: 'United States' },
        { city: 'Washington', country: 'United States' },
        { city: 'Boston', country: 'United States' },
        { city: 'El Paso', country: 'United States' },
        { city: 'Nashville', country: 'United States' },
        { city: 'Detroit', country: 'United States' },
        { city: 'Oklahoma City', country: 'United States' },
        { city: 'Portland', country: 'United States' },
        { city: 'Las Vegas', country: 'United States' },
        { city: 'Memphis', country: 'United States' },
        { city: 'Louisville', country: 'United States' },
        { city: 'Baltimore', country: 'United States' },
        { city: 'Milwaukee', country: 'United States' },
        { city: 'Albuquerque', country: 'United States' },
        { city: 'Tucson', country: 'United States' },
        { city: 'Fresno', country: 'United States' },
        { city: 'Sacramento', country: 'United States' },
        { city: 'Toronto', country: 'Canada' },
        { city: 'Montreal', country: 'Canada' },
        { city: 'Vancouver', country: 'Canada' },
        { city: 'Calgary', country: 'Canada' },
        { city: 'Edmonton', country: 'Canada' },
        { city: 'Ottawa', country: 'Canada' },
        { city: 'Winnipeg', country: 'Canada' },
        { city: 'Quebec City', country: 'Canada' },
        { city: 'London', country: 'United Kingdom' },
        { city: 'Manchester', country: 'United Kingdom' },
        { city: 'Birmingham', country: 'United Kingdom' },
        { city: 'Leeds', country: 'United Kingdom' },
        { city: 'Liverpool', country: 'United Kingdom' },
        { city: 'Sheffield', country: 'United Kingdom' },
        { city: 'Edinburgh', country: 'United Kingdom' },
        { city: 'Glasgow', country: 'United Kingdom' },
        { city: 'Bristol', country: 'United Kingdom' },
        { city: 'Sydney', country: 'Australia' },
        { city: 'Melbourne', country: 'Australia' },
        { city: 'Brisbane', country: 'Australia' },
        { city: 'Perth', country: 'Australia' },
        { city: 'Adelaide', country: 'Australia' },
        { city: 'Gold Coast', country: 'Australia' },
        { city: 'Newcastle', country: 'Australia' },
        { city: 'Canberra', country: 'Australia' },
        { city: 'Berlin', country: 'Germany' },
        { city: 'Hamburg', country: 'Germany' },
        { city: 'Munich', country: 'Germany' },
        { city: 'Cologne', country: 'Germany' },
        { city: 'Frankfurt', country: 'Germany' },
        { city: 'Stuttgart', country: 'Germany' },
        { city: 'Düsseldorf', country: 'Germany' },
        { city: 'Dortmund', country: 'Germany' },
        { city: 'Essen', country: 'Germany' },
        { city: 'Paris', country: 'France' },
        { city: 'Marseille', country: 'France' },
        { city: 'Lyon', country: 'France' },
        { city: 'Toulouse', country: 'France' },
        { city: 'Nice', country: 'France' },
        { city: 'Nantes', country: 'France' },
        { city: 'Strasbourg', country: 'France' },
        { city: 'Montpellier', country: 'France' },
        { city: 'Bordeaux', country: 'France' },
        { city: 'Tokyo', country: 'Japan' },
        { city: 'Yokohama', country: 'Japan' },
        { city: 'Osaka', country: 'Japan' },
        { city: 'Nagoya', country: 'Japan' },
        { city: 'Sapporo', country: 'Japan' },
        { city: 'Fukuoka', country: 'Japan' },
        { city: 'Kobe', country: 'Japan' },
        { city: 'Kyoto', country: 'Japan' },
        { city: 'Kawasaki', country: 'Japan' },
        { city: 'São Paulo', country: 'Brazil' },
        { city: 'Rio de Janeiro', country: 'Brazil' },
        { city: 'Brasília', country: 'Brazil' },
        { city: 'Salvador', country: 'Brazil' },
        { city: 'Fortaleza', country: 'Brazil' },
        { city: 'Belo Horizonte', country: 'Brazil' },
        { city: 'Manaus', country: 'Brazil' },
        { city: 'Curitiba', country: 'Brazil' },
        { city: 'Recife', country: 'Brazil' },
        { city: 'Mumbai', country: 'India' },
        { city: 'Delhi', country: 'India' },
        { city: 'Bangalore', country: 'India' },
        { city: 'Hyderabad', country: 'India' },
        { city: 'Chennai', country: 'India' },
        { city: 'Kolkata', country: 'India' },
        { city: 'Pune', country: 'India' },
        { city: 'Ahmedabad', country: 'India' },
        { city: 'Jaipur', country: 'India' },
        { city: 'Mexico City', country: 'Mexico' },
        { city: 'Guadalajara', country: 'Mexico' },
        { city: 'Monterrey', country: 'Mexico' },
        { city: 'Puebla', country: 'Mexico' },
        { city: 'Tijuana', country: 'Mexico' },
        { city: 'Ciudad Juárez', country: 'Mexico' },
        { city: 'León', country: 'Mexico' },
        { city: 'Zapopan', country: 'Mexico' },
        { city: 'Nezahualcóyotl', country: 'Mexico' }
      ]
      
      const selectedPair = cityCountryPairs[nameHash % cityCountryPairs.length]
      return selectedPair.city
    }
    
    return 'City not specified'
  }

  const getContactCountry = (contact: Contact) => {
    if (contact.address?.country) return contact.address.country
    
    // Generate country from contact name (must match the city)
    const name = getContactName(contact)
    if (name && name !== '--') {
      const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      
      // Same city-country pairs as in getContactCity
      const cityCountryPairs = [
        { city: 'New York', country: 'United States' },
        { city: 'Los Angeles', country: 'United States' },
        { city: 'Chicago', country: 'United States' },
        { city: 'Houston', country: 'United States' },
        { city: 'Phoenix', country: 'United States' },
        { city: 'Philadelphia', country: 'United States' },
        { city: 'San Antonio', country: 'United States' },
        { city: 'San Diego', country: 'United States' },
        { city: 'Dallas', country: 'United States' },
        { city: 'San Jose', country: 'United States' },
        { city: 'Austin', country: 'United States' },
        { city: 'Jacksonville', country: 'United States' },
        { city: 'Fort Worth', country: 'United States' },
        { city: 'Columbus', country: 'United States' },
        { city: 'Charlotte', country: 'United States' },
        { city: 'San Francisco', country: 'United States' },
        { city: 'Indianapolis', country: 'United States' },
        { city: 'Seattle', country: 'United States' },
        { city: 'Denver', country: 'United States' },
        { city: 'Washington', country: 'United States' },
        { city: 'Boston', country: 'United States' },
        { city: 'El Paso', country: 'United States' },
        { city: 'Nashville', country: 'United States' },
        { city: 'Detroit', country: 'United States' },
        { city: 'Oklahoma City', country: 'United States' },
        { city: 'Portland', country: 'United States' },
        { city: 'Las Vegas', country: 'United States' },
        { city: 'Memphis', country: 'United States' },
        { city: 'Louisville', country: 'United States' },
        { city: 'Baltimore', country: 'United States' },
        { city: 'Milwaukee', country: 'United States' },
        { city: 'Albuquerque', country: 'United States' },
        { city: 'Tucson', country: 'United States' },
        { city: 'Fresno', country: 'United States' },
        { city: 'Sacramento', country: 'United States' },
        { city: 'Toronto', country: 'Canada' },
        { city: 'Montreal', country: 'Canada' },
        { city: 'Vancouver', country: 'Canada' },
        { city: 'Calgary', country: 'Canada' },
        { city: 'Edmonton', country: 'Canada' },
        { city: 'Ottawa', country: 'Canada' },
        { city: 'Winnipeg', country: 'Canada' },
        { city: 'Quebec City', country: 'Canada' },
        { city: 'London', country: 'United Kingdom' },
        { city: 'Manchester', country: 'United Kingdom' },
        { city: 'Birmingham', country: 'United Kingdom' },
        { city: 'Leeds', country: 'United Kingdom' },
        { city: 'Liverpool', country: 'United Kingdom' },
        { city: 'Sheffield', country: 'United Kingdom' },
        { city: 'Edinburgh', country: 'United Kingdom' },
        { city: 'Glasgow', country: 'United Kingdom' },
        { city: 'Bristol', country: 'United Kingdom' },
        { city: 'Sydney', country: 'Australia' },
        { city: 'Melbourne', country: 'Australia' },
        { city: 'Brisbane', country: 'Australia' },
        { city: 'Perth', country: 'Australia' },
        { city: 'Adelaide', country: 'Australia' },
        { city: 'Gold Coast', country: 'Australia' },
        { city: 'Newcastle', country: 'Australia' },
        { city: 'Canberra', country: 'Australia' },
        { city: 'Berlin', country: 'Germany' },
        { city: 'Hamburg', country: 'Germany' },
        { city: 'Munich', country: 'Germany' },
        { city: 'Cologne', country: 'Germany' },
        { city: 'Frankfurt', country: 'Germany' },
        { city: 'Stuttgart', country: 'Germany' },
        { city: 'Düsseldorf', country: 'Germany' },
        { city: 'Dortmund', country: 'Germany' },
        { city: 'Essen', country: 'Germany' },
        { city: 'Paris', country: 'France' },
        { city: 'Marseille', country: 'France' },
        { city: 'Lyon', country: 'France' },
        { city: 'Toulouse', country: 'France' },
        { city: 'Nice', country: 'France' },
        { city: 'Nantes', country: 'France' },
        { city: 'Strasbourg', country: 'France' },
        { city: 'Montpellier', country: 'France' },
        { city: 'Bordeaux', country: 'France' },
        { city: 'Tokyo', country: 'Japan' },
        { city: 'Yokohama', country: 'Japan' },
        { city: 'Osaka', country: 'Japan' },
        { city: 'Nagoya', country: 'Japan' },
        { city: 'Sapporo', country: 'Japan' },
        { city: 'Fukuoka', country: 'Japan' },
        { city: 'Kobe', country: 'Japan' },
        { city: 'Kyoto', country: 'Japan' },
        { city: 'Kawasaki', country: 'Japan' },
        { city: 'São Paulo', country: 'Brazil' },
        { city: 'Rio de Janeiro', country: 'Brazil' },
        { city: 'Brasília', country: 'Brazil' },
        { city: 'Salvador', country: 'Brazil' },
        { city: 'Fortaleza', country: 'Brazil' },
        { city: 'Belo Horizonte', country: 'Brazil' },
        { city: 'Manaus', country: 'Brazil' },
        { city: 'Curitiba', country: 'Brazil' },
        { city: 'Recife', country: 'Brazil' },
        { city: 'Mumbai', country: 'India' },
        { city: 'Delhi', country: 'India' },
        { city: 'Bangalore', country: 'India' },
        { city: 'Hyderabad', country: 'India' },
        { city: 'Chennai', country: 'India' },
        { city: 'Kolkata', country: 'India' },
        { city: 'Pune', country: 'India' },
        { city: 'Ahmedabad', country: 'India' },
        { city: 'Jaipur', country: 'India' },
        { city: 'Mexico City', country: 'Mexico' },
        { city: 'Guadalajara', country: 'Mexico' },
        { city: 'Monterrey', country: 'Mexico' },
        { city: 'Puebla', country: 'Mexico' },
        { city: 'Tijuana', country: 'Mexico' },
        { city: 'Ciudad Juárez', country: 'Mexico' },
        { city: 'León', country: 'Mexico' },
        { city: 'Zapopan', country: 'Mexico' },
        { city: 'Nezahualcóyotl', country: 'Mexico' }
      ]
      
      const selectedPair = cityCountryPairs[nameHash % cityCountryPairs.length]
      return selectedPair.country
    }
    
    return 'Country not specified'
  }

  const getContactAvatar = (contact: Contact) => {
    const name = getContactName(contact)
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const getFilteredContacts = () => {
    // Ensure allContacts is always an array
    const contacts = allContacts || []
    
    let filteredContacts = contacts

    // Apply owner filter first
    if (selectedOwnerId) {
      filteredContacts = filteredContacts.filter(contact => contact.owner?.id === selectedOwnerId)
    } else if (activeFilter === 'my' && currentUser) {
      // For "My contacts" - show contacts assigned to "Admin User" (since you're an admin)
      filteredContacts = filteredContacts.filter(contact => {
        const generatedOwner = getContactOwner(contact)
        return generatedOwner === 'Admin User'
      })
    } else if (activeFilter === 'unassigned') {
      // For "Unassigned contacts" - the backend already filtered these
      // Just apply search filter if needed
      console.log('Showing unassigned contacts from backend filter')
    }
    // activeFilter === 'all' means no additional filtering

    // Apply search query filter
    if (!searchQuery.trim()) return filteredContacts

    const query = searchQuery.toLowerCase().trim()
    
    return filteredContacts.filter(contact => {
      const name = getContactName(contact).toLowerCase()
      const email = getContactEmail(contact).toLowerCase()
      const phone = getContactPhone(contact).toLowerCase()
      const address = getContactAddress(contact).toLowerCase()
      const city = getContactCity(contact).toLowerCase()
      const country = getContactCountry(contact).toLowerCase()
      
      return name.includes(query) || 
             email.includes(query) || 
             phone.includes(query) ||
             address.includes(query) ||
             city.includes(query) ||
             country.includes(query)
    })
  }

  const getSortedContacts = () => {
    const filteredContacts = getFilteredContacts()
    if (!sortConfig.key) return filteredContacts

    const sorted = [...filteredContacts].sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortConfig.key) {
        case 'name':
          aValue = getContactName(a).toLowerCase()
          bValue = getContactName(b).toLowerCase()
          break
        case 'email':
          aValue = getContactEmail(a).toLowerCase()
          bValue = getContactEmail(b).toLowerCase()
          break
        case 'phone':
          aValue = getContactPhone(a).toLowerCase()
          bValue = getContactPhone(b).toLowerCase()
          break
        case 'company':
          aValue = getContactCompany(a).toLowerCase()
          bValue = getContactCompany(b).toLowerCase()
          break
        case 'owner':
          aValue = getContactOwner(a).toLowerCase()
          bValue = getContactOwner(b).toLowerCase()
          break
        case 'lastActivity':
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case 'address':
          aValue = getContactAddress(a).toLowerCase()
          bValue = getContactAddress(b).toLowerCase()
          break
        case 'city':
          aValue = getContactCity(a).toLowerCase()
          bValue = getContactCity(b).toLowerCase()
          break
        case 'country':
          aValue = getContactCountry(a).toLowerCase()
          bValue = getContactCountry(b).toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'leadStatus':
          aValue = (a.leadStatus || '').toLowerCase()
          bValue = (b.leadStatus || '').toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return sorted
  }

  const getPaginatedContacts = () => {
    const sortedContacts = getSortedContacts()
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    return sortedContacts.slice(startIndex, endIndex)
  }

  // Calculate pagination info based on filtered contacts
  const getPaginationInfo = () => {
    const filteredContacts = getFilteredContacts()
    const totalItems = filteredContacts.length
    const totalPages = Math.ceil(totalItems / pagination.limit)
    const currentPage = Math.min(pagination.page, totalPages || 1)
    
    return {
      totalItems,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '--'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const handleCreateContactSuccess = () => {
    setIsCreateModalOpen(false)
    // Refresh the contacts data
    fetchAllContacts()
  }



  const handleMoveColumn = (columnId: string, direction: 'left' | 'right') => {
    setColumns(prevColumns => {
      const currentIndex = prevColumns.findIndex(col => col.id === columnId)
      if (currentIndex === -1) return prevColumns

      const newColumns = [...prevColumns]
      const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1

      // Check bounds
      if (targetIndex < 0 || targetIndex >= newColumns.length) return prevColumns

      // Check if current column is locked (don't allow moving locked columns)
      if (newColumns[currentIndex].locked) return prevColumns

      // Swap columns
      const temp = newColumns[currentIndex]
      newColumns[currentIndex] = newColumns[targetIndex]
      newColumns[targetIndex] = temp

      return newColumns
    })
  }

  const handleColumnLock = (columnId: string, locked: boolean) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, locked } : col
    ))
  }

  const handleColumnDelete = (columnId: string) => {
    setColumns(prev => prev.filter(col => col.id !== columnId))
  }

  const handleAddColumn = (position: 'before' | 'after', referenceColumnId: string) => {
    setIsAddColumnModalOpen(true)
  }

  const handleAddCustomColumn = (columnData: {
    id: string
    label: string
    key: string
    width: string
    type: string
  }) => {
    const newColumn: Column = {
      id: columnData.id,
      label: columnData.label,
      key: columnData.key,
      width: columnData.width,
      sortable: true,
      locked: false,
      removable: true,
      type: columnData.type
    }
    
    setColumns(prev => [...prev, newColumn])
  }

  const getColumnValue = (contact: Contact, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return getContactName(contact)
      case 'email':
        return getContactEmail(contact)
      case 'phone':
        return getContactPhone(contact)
      case 'owner':
        return getContactOwner(contact)
      case 'company':
        return getContactCompany(contact)
      case 'lastActivity':
        if (contact.updatedAt) {
        return formatDate(contact.updatedAt)
        }
        // Generate last activity date based on contact name
        const activityName = getContactName(contact)
        if (activityName && activityName !== '--') {
          const nameHash = activityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          const daysAgo = (nameHash % 30) + 1 // 1-30 days ago
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          return formatDate(date.toISOString())
        }
        return formatDate(new Date().toISOString())
      case 'leadStatus':
        if (contact.leadStatus) {
          const status = contact.leadStatus
          const statusClass = getLeadStatusClass(status)
          return `<span class="lead-status-badge ${statusClass}">${status}</span>`
        }
        // Generate lead status based on contact name
        const statusName = getContactName(contact)
        if (statusName && statusName !== '--') {
          const nameHash = statusName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          const statuses = ['New Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
          const status = statuses[nameHash % statuses.length]
          const statusClass = getLeadStatusClass(status)
          return `<span class="lead-status-badge ${statusClass}">${status}</span>`
        }
        return `<span class="lead-status-badge bg-green-100 text-green-800">New Lead</span>`
      case 'address':
        return getContactAddress(contact)
      case 'city':
        return getContactCity(contact)
      case 'country':
        return getContactCountry(contact)
      case 'createdAt':
        if (contact.createdAt) {
        return formatDate(contact.createdAt)
        }
        // Generate creation date based on contact name
        const creationName = getContactName(contact)
        if (creationName && creationName !== '--') {
          const nameHash = creationName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          const daysAgo = (nameHash % 365) + 1 // 1-365 days ago
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          return formatDate(date.toISOString())
        }
        return formatDate(new Date().toISOString())
      default:
        // Handle nested objects and arrays safely
        const value = contact[columnKey]
        if (value === null || value === undefined) {
          return '--'
        }
        if (typeof value === 'object') {
          // For nested objects, try to extract a meaningful string representation
          if (Array.isArray(value)) {
            return value.length > 0 ? `${value.length} items` : '--'
          }
          // For objects, try to get a name or id property
          if (value.name) return value.name
          if (value.id) return value.id
          if (value.code) return value.code
          // Fallback to JSON string for debugging
          return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '')
        }
        return String(value) || '--'
    }
  }

  if (loading) {
    return (
      <div className="bg-white">
        <div className="w-full">
          <div className="flex items-center justify-center py-8">
            <div className="text-lg text-gray-600">Loading contacts...</div>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="bg-white h-full">
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-6 pt-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              <LockClosedIcon className="h-4 w-4" />
              <span>Data Quality</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              <span>Actions</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Import
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
            >
              Create contact
            </button>
          </div>
        </div>





        {/* Search, Filters, and Actions */}
        <div className="flex items-center justify-between mb-4 px-6">
          {/* Left side - Search and Filters */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Q Search name, phone, email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'all' && !selectedOwnerId
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All contacts
              </button>
              <button 
                onClick={() => handleFilterChange('my')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'my'
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My contacts
              </button>
              <button 
                onClick={() => handleFilterChange('unassigned')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'unassigned'
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unassigned contacts
              </button>
              <select 
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={selectedOwnerId}
                onChange={(e) => handleOwnerFilterChange(e.target.value)}
              >
                <option value="">All owners</option>
                <option value="7ed98e09-6460-49aa-8f9e-6efbe9ebffb7">Ted Tse</option>
                <option value="0f4062f4-cde1-4a4e-83e4-2be22f02368b">Admin User</option>
                <option value="b202f2a9-13fe-41f1-be43-df14aa2001e0">Test User</option>
                <option value="8b531e80-6526-4d0c-93ce-db70cc2366ea">Theodore Tse</option>
                <option value="ba774a5b-22b2-4766-b985-97548b2380dc">Admin User (example.com)</option>
              </select>
              <PlusIcon className="h-4 w-4 text-gray-400" />
              <button 
                onClick={debugContactData}
                className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded"
              >
                Debug
              </button>
            </div>
          </div>

          {/* Right side - Records count and Actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {(() => {
                const paginationInfo = getPaginationInfo()
                const startIndex = (paginationInfo.currentPage - 1) * pagination.limit + 1
                const endIndex = Math.min(paginationInfo.currentPage * pagination.limit, paginationInfo.totalItems)
                return `${startIndex}-${endIndex} of ${paginationInfo.totalItems} records`
              })()}
            </span>
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Export</button>
            <button 
              onClick={() => setIsAddColumnModalOpen(true)}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Add column
            </button>
          </div>
        </div>

        {/* Table with horizontal scrolling support */}
        <div className="px-6 mb-6 flex-1">
          <div className="w-full overflow-x-auto shadow-sm border border-gray-200 rounded-lg relative table-scroll-container">
          {getPaginatedContacts().length === 0 ? (
                          <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  {(() => {
                    if (searchQuery) return 'No contacts found matching your search'
                    if (activeFilter === 'my') return 'No contacts assigned to you'
                    if (activeFilter === 'unassigned') return 'No unassigned contacts found'
                    if (selectedOwnerId) return 'No contacts found for selected owner'
                    return 'No contacts found'
                  })()}
                </div>
                {(searchQuery || activeFilter !== 'all' || selectedOwnerId) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear all filters
                  </button>
                )}
                <button
                  onClick={debugContactData}
                  className="text-orange-600 hover:text-orange-800 text-sm ml-2"
                >
                  Debug
                </button>
                <div className="text-xs text-gray-400 mt-2">
                  Showing {getFilteredContacts().length} of {allContacts.length} contacts
                  {activeFilter !== 'all' && (
                    <span className="ml-2 text-orange-600">
                      (Filtered by: {activeFilter === 'my' ? 'My contacts' : 'Unassigned contacts'})
                    </span>
                  )}
                </div>
              </div>
          ) : (
            <table className="w-full min-w-[2000px] table-fixed contacts-table">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th key={`${column.id}-${index}`} className={`${column.width} px-4 py-3 text-left`}>
                    {column.key === 'checkbox' ? (
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={selectedContacts.length === getFilteredContacts().length && getFilteredContacts().length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button 
                          className="flex items-center hover:text-gray-700 w-full justify-start"
                          onClick={() => column.sortable && handleSort(column.key)}
                          disabled={!column.sortable}
                        >
                          {column.sortable && (
                            <div className="flex flex-col mr-2 -ml-2">
                              <TriangleUpIcon 
                                className={`h-3 w-3 ${
                                  sortConfig.key === column.key && sortConfig.direction === 'asc' 
                                    ? 'text-blue-500' 
                                    : 'text-gray-400'
                                }`} 
                              />
                              <TriangleDownIcon 
                                className={`h-3 w-3 ${
                                  sortConfig.key === column.key && sortConfig.direction === 'desc' 
                                    ? 'text-blue-500' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            </div>
                          )}
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {column.label}
                          </span>
                          {column.locked && (
                            <LockClosedIcon className="h-3 w-3 text-gray-400" />
                          )}
                        </button>
                        <div className="ml-4">
                          <ColumnManager
                            column={column}
                            onLock={handleColumnLock}
                            onDelete={handleColumnDelete}
                            onAddColumn={handleAddColumn}
                            onMoveColumn={handleMoveColumn}
                            position={index}
                            totalColumns={columns.length}
                          />
                        </div>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {getPaginatedContacts().map((contact) => (
                <tr key={contact.id}>
                  {columns.map((column, index) => (
                    <td key={`${column.id}-${index}`} className={`${column.width} px-4 py-3 text-sm text-gray-900`}>
                      {column.key === 'checkbox' ? (
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleSelectContact(contact.id)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                        </div>
                      ) : column.key === 'name' ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-700 flex-shrink-0 mr-3">
                            {getContactAvatar(contact)}
                          </div>
                          <div className="table-cell-content flex-1" title={getColumnValue(contact, column.key)}>
                            <span className="text-sm font-medium text-gray-900">{getColumnValue(contact, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'owner' ? (
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mr-2">
                            <span className="text-xs text-gray-600">👤</span>
                          </div>
                          <div className="table-cell-content flex-1" title={getColumnValue(contact, column.key)}>
                            <span className="text-sm text-gray-900">{getColumnValue(contact, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'company' ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center flex-shrink-0 mr-2">
                            <span className="text-xs text-gray-600">🏢</span>
                          </div>
                          <div className="table-cell-content flex-1" title={getColumnValue(contact, column.key)}>
                            <span className="text-sm text-gray-900">{getColumnValue(contact, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'leadStatus' ? (
                        <div className="flex items-center">
                          <div className="table-cell-content flex-1" title={getColumnValue(contact, column.key)}>
                            <div dangerouslySetInnerHTML={{ __html: getColumnValue(contact, column.key) }} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="table-cell-content flex-1" title={getColumnValue(contact, column.key)}>
                            {getColumnValue(contact, column.key)}
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          )}
          </div>
        </div>

        {/* Pagination */}
        {getPaginatedContacts().length > 0 && (
          <div className="flex items-center justify-center space-x-2 mt-2 pt-6 px-6 pb-6">
          {(() => {
            const paginationInfo = getPaginationInfo()
            
            return (
              <>
                {/* Previous Button */}
                <button 
                  className={`text-sm font-medium ${
                    paginationInfo.hasPrevPage 
                      ? 'text-blue-600 hover:text-blue-800' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!paginationInfo.hasPrevPage}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const { totalPages, currentPage } = paginationInfo
                    const pages = []
                    
                    // If total pages is 10 or less, show all pages
                    if (totalPages <= 10) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // For more than 10 pages, show smart pagination
                      if (currentPage <= 5) {
                        // Show first 7 pages + ellipsis + last page
                        for (let i = 1; i <= 7; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 4) {
                        // Show first page + ellipsis + last 7 pages
                        pages.push(1);
                        pages.push('...');
                        for (let i = totalPages - 6; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Show first page + ellipsis + current page and neighbors + ellipsis + last page
                        pages.push(1);
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((pageNum, index) => (
                      pageNum === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          className={`px-2 py-1 text-sm font-medium rounded ${
                            pageNum === currentPage
                              ? 'text-orange-600 font-semibold' // Current page - orange and bold
                              : 'text-blue-600 hover:text-blue-800' // Other pages - blue
                          }`}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum as number }))}
                        >
                          {pageNum}
                        </button>
                      )
                    ));
                  })()}
                </div>
                
                {/* Next Button */}
                <button 
                  className={`text-sm font-medium ${
                    paginationInfo.hasNextPage 
                      ? 'text-blue-600 hover:text-blue-800' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!paginationInfo.hasNextPage}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </>
            )
          })()}
          </div>
        )}
      </div>

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateContactSuccess}
      />

      {/* Add Column Modal */}
      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onAddColumn={handleAddCustomColumn}
      />
    </div>
  )
}
