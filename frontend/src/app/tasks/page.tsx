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
import { TriangleUpIcon, TriangleDownIcon } from '@/components/ui/triangle-icons'
import { ColumnManager } from '@/components/ui/column-manager'
import { AddColumnModal } from '@/components/ui/add-column-modal'

interface Task {
  id: string
  title: string
  description?: string
  typeId?: string
  type?: {
    id: string
    name: string
  }
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE'
  dueDate?: string
  completedAt?: string
  assignedUserId?: string
  assignedUser?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  createdBy?: string
  createdByUser?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  leadId?: string
  lead?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  dealId?: string
  deal?: {
    id: string
    name: string
  }
  tenantId: string
  createdAt: string
  updatedAt: string
  [key: string]: any
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

interface TasksResponse {
  data: Task[]
  pagination: {
    limit: number
    page: number
    total: number
    totalPages: number
  }
}

export default function TasksPage() {
  const [loading, setLoading] = useState(true)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [allTasks, setAllTasks] = useState<Task[]>([])
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
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false)
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'overdue' | 'due-today' | 'upcoming'>('all')
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<{ id: string; firstName: string; lastName: string } | null>(null)
  
  // Column configuration
  const [columns, setColumns] = useState<Column[]>([
    { id: 'checkbox', label: '', key: 'checkbox', width: 'w-16', sortable: false, locked: true, removable: false },
    { id: 'status', label: 'STATUS', key: 'status', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'title', label: 'TITLE', key: 'title', width: 'w-80', sortable: true, locked: false, removable: false },
    { id: 'priority', label: 'PRIORITY', key: 'priority', width: 'w-32', sortable: true, locked: false, removable: false },
    { id: 'type', label: 'TASK TYPE', key: 'type', width: 'w-40', sortable: true, locked: false, removable: false },
    { id: 'assignedTo', label: 'ASSIGNED TO', key: 'assignedTo', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'dueDate', label: 'DUE DATE', key: 'dueDate', width: 'w-40', sortable: true, locked: false, removable: false },
    { id: 'lead', label: 'ASSOCIATED LEAD', key: 'lead', width: 'w-56', sortable: true, locked: false, removable: false },
    { id: 'deal', label: 'ASSOCIATED DEAL', key: 'deal', width: 'w-56', sortable: true, locked: false, removable: false },
    { id: 'createdBy', label: 'CREATED BY', key: 'createdBy', width: 'w-48', sortable: true, locked: false, removable: false },
    { id: 'createdAt', label: 'CREATED DATE', key: 'createdAt', width: 'w-48', sortable: true, locked: false, removable: false }
  ])

  // Fetch all tasks for search functionality
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await fetchAllTasks()
      await getCurrentUser()
      setLoading(false)
    }
    loadInitialData()
  }, [activeFilter])

  // Reset to first page when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchQuery])

  // Reset to first page when filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [activeFilter, selectedAssigneeId])

  // Ensure current page doesn't exceed total pages when data changes
  useEffect(() => {
    const paginationInfo = getPaginationInfo()
    if (pagination.page > paginationInfo.totalPages && paginationInfo.totalPages > 0) {
      setPagination(prev => ({ ...prev, page: paginationInfo.totalPages }))
    }
  }, [allTasks, searchQuery, activeFilter, selectedAssigneeId])

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

  const fetchAllTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        setAllTasks([]) // Set empty array instead of leaving undefined
        return
      }

      // Build query parameters based on current filter
      const params = new URLSearchParams()
      params.append('limit', '1000')
      
      if (activeFilter === 'overdue') {
        params.append('overdue', 'true')
      } else if (activeFilter === 'due-today') {
        params.append('dueToday', 'true')
      } else if (activeFilter === 'upcoming') {
        params.append('upcoming', 'true')
      }

      const response = await fetch(`http://localhost:8089/api/crm/tasks?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch all tasks for search:', response.status, response.statusText)
        setAllTasks([]) // Set empty array on error
        return
      }

      const responseData = await response.json()
      console.log('API Response:', responseData)
      console.log('Response type:', typeof responseData)
      console.log('Is array:', Array.isArray(responseData))
      
      // Handle both response formats: array directly or wrapped in data property
      let tasks: Task[] = []
      if (Array.isArray(responseData)) {
        // API returned array directly
        tasks = responseData
        console.log('Using array response, tasks count:', tasks.length)
      } else if (responseData && responseData.data) {
        // API returned wrapped response
        tasks = responseData.data
        console.log('Using wrapped response, tasks count:', tasks.length)
      }
      
      setAllTasks(tasks || []) // Ensure we always set an array
    } catch (err) {
      console.error('Error fetching all tasks for search:', err)
      setAllTasks([]) // Set empty array on error
    }
  }

  const handleFilterChange = (filter: 'all' | 'my' | 'overdue' | 'due-today' | 'upcoming') => {
    setActiveFilter(filter)
    setSelectedAssigneeId('')
  }

  const handleAssigneeFilterChange = (assigneeId: string) => {
    setSelectedAssigneeId(assigneeId)
    setActiveFilter('all')
  }

  const clearAllFilters = () => {
    setActiveFilter('all')
    setSelectedAssigneeId('')
    setSearchQuery('')
  }

  const debugTaskData = () => {
    console.log('allTasks:', allTasks)
    console.log('allTasks length:', allTasks?.length || 0)
    console.log('Current user:', currentUser)
    
    if (allTasks && allTasks.length > 0) {
      console.log('Sample task data:', allTasks[0])
      console.log('Tasks with assignees:', allTasks.filter(t => t.assignedUser).length)
      console.log('Tasks without assignees:', allTasks.filter(t => !t.assignedUser).length)
    } else {
      console.log('No tasks found or allTasks is undefined')
    }
  }

  const getTaskAssignee = (task: Task) => {
    // Use live data from API response
    if (task.assignedUser && task.assignedUser.firstName && task.assignedUser.lastName) {
      return `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
    }
    
    if (task.assignedUserId) {
      return 'Assigned (Unknown User)'
    }
    
    return 'Unassigned'
  }

  const getTaskStatus = (task: Task) => {
    return task.status || 'PENDING'
  }

  const getTaskPriority = (task: Task) => {
    return task.priority || 'MEDIUM'
  }

  const getTaskType = (task: Task) => {
    // Use live data from API response
    if (task.type && task.type.name) {
      return task.type.name
    }
    
    // Fallback to typeId if type object not available
    if (task.typeId) {
      return `Type ${task.typeId.slice(0, 8)}...`
    }
    
    return 'General'
  }

  const getTaskLead = (task: Task) => {
    // Use live data from API response
    if (task.lead && task.lead.firstName && task.lead.lastName) {
      return `${task.lead.firstName} ${task.lead.lastName}`
    }
    
    // Fallback to leadId if lead object not available
    if (task.leadId) {
      return `Lead ${task.leadId.slice(0, 8)}...`
    }
    
    return '--'
  }

  const getTaskDeal = (task: Task) => {
    // Use live data from API response
    if (task.deal && task.deal.name) {
      return task.deal.name
    }
    
    // Fallback to dealId if deal object not available
    if (task.dealId) {
      return `Deal ${task.dealId.slice(0, 8)}...`
    }
    
    return '--'
  }

  const getTaskCreatedBy = (task: Task) => {
    // Use live data from API response
    if (task.createdByUser && task.createdByUser.firstName && task.createdByUser.lastName) {
      return `${task.createdByUser.firstName} ${task.createdByUser.lastName}`
    }
    
    // Fallback to createdBy ID if user object not available
    if (task.createdBy) {
      // Map known user IDs to names for better display
      const userMap: Record<string, string> = {
        '7ed98e09-6460-49aa-8f9e-6efbe9ebffb7': 'Ted Tse',
        '0f4062f4-cde1-4a4e-83e4-2be22f02368b': 'Admin User',
        'b202f2a9-13fe-41f1-be43-df14aa2001e0': 'Test User'
      }
      
      return userMap[task.createdBy] || `User ${task.createdBy.slice(0, 8)}...`
    }
    
    return '--'
  }

  const getTaskDueDate = (task: Task) => {
    // Use live data from API response
    if (task.dueDate) {
      const date = new Date(task.dueDate)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    return '--'
  }

  const getTaskCreatedDate = (task: Task) => {
    // Use live data from API response
    if (task.createdAt) {
      const date = new Date(task.createdAt)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    return '--'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      case 'IN_PROGRESS':
        return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      case 'OVERDUE':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      case 'CANCELLED':
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
      default:
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-50'
      case 'HIGH':
        return 'text-orange-600 bg-orange-50'
      case 'MEDIUM':
        return 'text-blue-600 bg-blue-50'
      case 'LOW':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50'
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-50'
      case 'OVERDUE':
        return 'text-red-600 bg-red-50'
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const getFilteredTasks = () => {
    const tasks = allTasks || []
    
    let filteredTasks = tasks

    if (selectedAssigneeId) {
      filteredTasks = filteredTasks.filter(task => task.assignedUser?.id === selectedAssigneeId)
    } else if (activeFilter === 'my' && currentUser) {
      filteredTasks = filteredTasks.filter(task => {
        const generatedAssignee = getTaskAssignee(task)
        return generatedAssignee === `${currentUser.firstName} ${currentUser.lastName}`
      })
    } else if (activeFilter === 'overdue') {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate || task.status === 'COMPLETED') return false
        return new Date(task.dueDate) < new Date()
      })
    } else if (activeFilter === 'due-today') {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false
        const today = new Date()
        const dueDate = new Date(task.dueDate)
        return dueDate.toDateString() === today.toDateString()
      })
    } else if (activeFilter === 'upcoming') {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false
        return new Date(task.dueDate) > new Date()
      })
    }

    if (!searchQuery.trim()) return filteredTasks

    const query = searchQuery.toLowerCase().trim()
    
    return filteredTasks.filter(task => {
      const title = task.title.toLowerCase()
      const description = (task.description || '').toLowerCase()
      const assignee = getTaskAssignee(task).toLowerCase()
      const type = getTaskType(task).toLowerCase()
      const lead = getTaskLead(task).toLowerCase()
      const deal = getTaskDeal(task).toLowerCase()
      
      return title.includes(query) || 
             description.includes(query) || 
             assignee.includes(query) ||
             type.includes(query) ||
             lead.includes(query) ||
             deal.includes(query)
    })
  }

  const getSortedTasks = () => {
    const filteredTasks = getFilteredTasks()
    if (!sortConfig.key) return filteredTasks

    const sorted = [...filteredTasks].sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortConfig.key) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'status':
          aValue = getTaskStatus(a).toLowerCase()
          bValue = getTaskStatus(b).toLowerCase()
          break
        case 'priority':
          aValue = getTaskPriority(a).toLowerCase()
          bValue = getTaskPriority(b).toLowerCase()
          break
        case 'type':
          aValue = getTaskType(a).toLowerCase()
          bValue = getTaskType(b).toLowerCase()
          break
        case 'assignedTo':
          aValue = getTaskAssignee(a).toLowerCase()
          bValue = getTaskAssignee(b).toLowerCase()
          break
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
          break
        case 'lead':
          aValue = getTaskLead(a).toLowerCase()
          bValue = getTaskLead(b).toLowerCase()
          break
        case 'deal':
          aValue = getTaskDeal(a).toLowerCase()
          bValue = getTaskDeal(b).toLowerCase()
          break
        case 'createdBy':
          aValue = getTaskCreatedBy(a).toLowerCase()
          bValue = getTaskCreatedBy(b).toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }

  const getPaginatedTasks = () => {
    const sortedTasks = getSortedTasks()
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    return sortedTasks.slice(startIndex, endIndex)
  }

  const getPaginationInfo = () => {
    const totalItems = getSortedTasks().length
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

  const handleSelectAll = () => {
    const filteredTasks = getFilteredTasks()
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id))
    }
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
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

  const getColumnValue = (task: Task, columnKey: string) => {
    // Use live data from API response for all columns
    switch (columnKey) {
      case 'title':
        return task.title || '--'
      case 'status':
        return getTaskStatus(task)
      case 'priority':
        return getTaskPriority(task)
      case 'type':
        return getTaskType(task)
      case 'assignedTo':
        return getTaskAssignee(task)
      case 'dueDate':
        return getTaskDueDate(task)
      case 'lead':
        return getTaskLead(task)
      case 'deal':
        return getTaskDeal(task)
      case 'createdBy':
        return getTaskCreatedBy(task)
      case 'createdAt':
        return getTaskCreatedDate(task)
      case 'description':
        return task.description || '--'
      default:
        // Handle any other column keys with live data
        const value = task[columnKey]
        if (value === null || value === undefined) {
          return '--'
        }
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            return value.length > 0 ? `${value.length} items` : '--'
          }
          if (value.name) return value.name
          if (value.id) return value.id
          if (value.code) return value.code
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
            <div className="text-lg text-gray-600">Loading tasks...</div>
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
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
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
          <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
            Create task
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
                placeholder="Q Search task title and notes"
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
                  activeFilter === 'all' && !selectedAssigneeId
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All tasks
              </button>
              <button 
                onClick={() => handleFilterChange('my')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'my'
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My tasks
              </button>
              <button 
                onClick={() => handleFilterChange('overdue')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'overdue'
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overdue
              </button>
              <button 
                onClick={() => handleFilterChange('due-today')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'due-today'
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Due today
              </button>
              <button 
                onClick={() => handleFilterChange('upcoming')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'upcoming'
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming
        </button>
              <select 
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={selectedAssigneeId}
                onChange={(e) => handleAssigneeFilterChange(e.target.value)}
              >
                <option value="">All assignees</option>
                <option value="7ed98e09-6460-49aa-8f9e-6efbe9ebffb7">Ted Tse</option>
                <option value="0f4062f4-cde1-4a4e-83e4-2be22f02368b">Admin User</option>
                <option value="b202f2a9-13fe-41f1-be43-df14aa2001e0">Test User</option>
                <option value="8b531e80-6526-4d0c-93ce-db70cc2366ea">Theodore Tse</option>
                <option value="ba774a5b-22b2-4766-b985-97548b2380dc">Admin User (example.com)</option>
              </select>
              <PlusIcon className="h-4 w-4 text-gray-400" />
              <button 
                onClick={debugTaskData}
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
          {getPaginatedTasks().length === 0 ? (
                          <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  {(() => {
                    if (searchQuery) return 'No tasks found matching your search'
                    if (activeFilter === 'my') return 'No tasks assigned to you'
                    if (activeFilter === 'overdue') return 'No overdue tasks found'
                    if (activeFilter === 'due-today') return 'No tasks due today'
                    if (activeFilter === 'upcoming') return 'No upcoming tasks found'
                    if (selectedAssigneeId) return 'No tasks found for selected assignee'
                    return 'No tasks found'
                  })()}
          </div>
                {(searchQuery || activeFilter !== 'all' || selectedAssigneeId) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear all filters
          </button>
                )}
                <button
                  onClick={debugTaskData}
                  className="text-orange-600 hover:text-orange-800 text-sm ml-2"
                >
                  Debug
          </button>
                <div className="text-xs text-gray-400 mt-2">
                  Showing {getFilteredTasks().length} of {allTasks.length} tasks
                  {activeFilter !== 'all' && (
                    <span className="ml-2 text-orange-600">
                      (Filtered by: {activeFilter === 'my' ? 'My tasks' : activeFilter === 'overdue' ? 'Overdue tasks' : activeFilter === 'due-today' ? 'Tasks due today' : 'Upcoming tasks'})
                    </span>
                  )}
        </div>
      </div>
          ) : (
            <table className="w-full min-w-[2000px] table-fixed tasks-table">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th key={`${column.id}-${index}`} className={`${column.width} px-4 py-3 text-left`}>
                    {column.key === 'checkbox' ? (
                      <div className="flex justify-center">
                <input
                  type="checkbox"
                          checked={selectedTasks.length === getFilteredTasks().length && getFilteredTasks().length > 0}
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
              {getPaginatedTasks().map((task) => (
                <tr key={task.id}>
                  {columns.map((column, index) => (
                    <td key={`${column.id}-${index}`} className={`${column.width} px-4 py-3 text-sm text-gray-900`}>
                      {column.key === 'checkbox' ? (
                        <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleSelectTask(task.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                        </div>
                      ) : column.key === 'title' ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-700 flex-shrink-0 mr-3">
                            📋
                          </div>
                          <div className="table-cell-content flex-1" title={getColumnValue(task, column.key)}>
                            <span className="text-sm font-medium text-gray-900">{getColumnValue(task, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'status' ? (
                        <div className="flex items-center">
                          <div className="table-cell-content flex-1" title={getColumnValue(task, column.key)}>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(getTaskStatus(task))}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(getTaskStatus(task))}`}>
                                {getColumnValue(task, column.key)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : column.key === 'priority' ? (
                        <div className="flex items-center">
                          <div className="table-cell-content flex-1" title={getColumnValue(task, column.key)}>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(getTaskPriority(task))}`}>
                              {getColumnValue(task, column.key)}
                  </span>
                          </div>
                        </div>
                      ) : column.key === 'assignedTo' ? (
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mr-2">
                            <span className="text-xs text-gray-600">👤</span>
                          </div>
                          <div className="table-cell-content flex-1" title={getColumnValue(task, column.key)}>
                            <span className="text-sm text-gray-900">{getColumnValue(task, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'lead' ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center flex-shrink-0 mr-2">
                            <span className="text-xs text-gray-600">👤</span>
                          </div>
                          <div className="table-cell-content flex-1" title={getColumnValue(task, column.key)}>
                            <span className="text-sm text-gray-900">{getColumnValue(task, column.key)}</span>
                          </div>
                        </div>
                      ) : column.key === 'deal' ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center flex-shrink-0 mr-2">
                            <span className="text-xs text-gray-600">💰</span>
                          </div>
                          <div className="table-cell-content flex-1" title={getColumnValue(task, column.key)}>
                            <span className="text-sm text-gray-900">{getColumnValue(task, column.key)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="table-cell-content flex-1" title={getColumnValue(task, column.key)}>
                            {getColumnValue(task, column.key)}
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
        {getPaginatedTasks().length > 0 && (
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

      {/* Add Column Modal */}
      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onAddColumn={handleAddCustomColumn}
      />
    </div>
  )
}
