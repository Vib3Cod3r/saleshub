'use client'

import { useState } from 'react'
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  PlusIcon, 
  FunnelIcon,
  EllipsisHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon as ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

interface Task {
  id: string
  title: string
  associatedContact: string
  associatedCompany: string
  lastContacted: string
  lastEngagement: string
  taskType: string
  dueDate: string
  status: 'completed' | 'pending'
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Send Email to Joe',
    associatedContact: '--',
    associatedCompany: '--',
    lastContacted: '--',
    lastEngagement: '--',
    taskType: 'Email',
    dueDate: 'August 20, 2025 8:',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Meet Jim',
    associatedContact: '--',
    associatedCompany: '--',
    lastContacted: '--',
    lastEngagement: '--',
    taskType: 'To-do',
    dueDate: 'August 20, 2025 8:',
    status: 'completed'
  }
]

export default function TasksPage() {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [currentView, setCurrentView] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCalendarBanner, setShowCalendarBanner] = useState(true)

  const handleSelectAll = () => {
    if (selectedTasks.length === mockTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(mockTasks.map(task => task.id))
    }
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-orange-500 bg-white border border-orange-500 rounded-md hover:bg-orange-50">
            Manage queues
          </button>
          
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Import
          </button>
          
          <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
            Create task
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 mb-4">
        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
          <span>All</span>
          <span className="text-gray-500">×</span>
        </button>
        <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Due today</button>
        <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Overdue</button>
        <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Upcoming</button>
        
        <div className="flex items-center space-x-4 ml-auto">
          <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
            <PlusIcon className="h-4 w-4" />
            <span>+ Add view (4/50)</span>
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700">All Views</button>
        </div>
      </div>

      {/* Calendar Integration Banner */}
      {showCalendarBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              Want to see your tasks on your Google or Outlook calendar? Connect a new calendar to sync tasks created in HubSpot. Go to settings
            </p>
            <button 
              onClick={() => setShowCalendarBanner(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar and Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md">
            <span>(1) Assignee</span>
            <span className="text-blue-500">×</span>
          </div>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Task type</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Due date</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white">
            <option>Queue</option>
          </select>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
            <FunnelIcon className="h-4 w-4" />
            <span>More filters</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Save view
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
            <LockClosedIcon className="h-4 w-4" />
            <span>Start 0 tasks</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search task title and notes"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Table Actions */}
      <div className="flex items-center justify-end mb-4">
        <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Edit columns</button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === mockTasks.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>STATUS</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>TITLE</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>ASSOCIATED CONTACT</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>ASSOCIATED COMPANY</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>LAST CONTACTED</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>LAST ENGAGEMENT</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>TASK TYPE</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>DUE DATE</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleSelectTask(task.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800">
                    {task.title}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{task.associatedContact}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{task.associatedCompany}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{task.lastContacted}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{task.lastEngagement}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{task.taskType}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{task.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-gray-200">
        <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Prev</span>
        </button>
        <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
          <span>Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">25 per page</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
