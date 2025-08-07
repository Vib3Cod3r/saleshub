'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Bell, 
  Calendar,
  Filter
} from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = () => {
    const pageMap: Record<string, string> = {
      '/': 'Dashboard',
      '/deals': 'Deals',
      '/contacts': 'Contacts',
      '/tasks': 'Tasks',
      '/pipeline': 'Pipeline',
      '/communications': 'Communications',
      '/settings': 'Settings',
    };
    return pageMap[pathname] || 'Dashboard';
  };

  const getAddNewLabel = () => {
    const labelMap: Record<string, string> = {
      '/deals': 'Add New Deal',
      '/contacts': 'Add New Contact',
      '/tasks': 'Add New Task',
      '/communications': 'Add New Communication',
    };
    return labelMap[pathname] || 'Add New';
  };

  const handleAddNew = () => {
    const actionMap: Record<string, string> = {
      '/deals': '/deals/new',
      '/contacts': '/contacts/new',
      '/tasks': '/tasks/new',
      '/communications': '/communications/new',
    };
    const targetPath = actionMap[pathname];
    if (targetPath) {
      router.push(targetPath);
    }
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement global search functionality
      console.log('Global search:', searchQuery);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return `${startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })} - ${endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;
  };

  return (
    <header className={`header ${className}`}>
      {/* Header Left */}
      <div className="header-left">
        <h1 className="page-title">{getPageTitle()}</h1>
        <div className="date-range">
          <Calendar className="h-4 w-4" />
          <span>{getDateRange()}</span>
        </div>
      </div>

      {/* Header Center */}
      <div className="header-center">
        <form onSubmit={handleGlobalSearch} className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search deals, contacts, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <Filter className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Header Right */}
      <div className="header-right">
        <button 
          className="btn btn-primary add-new-btn"
          onClick={handleAddNew}
        >
          <Plus className="h-4 w-4" />
          <span>{getAddNewLabel()}</span>
        </button>

        <div className="notifications">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button 
                  className="mark-all-read"
                  onClick={() => setShowNotifications(false)}
                >
                  Mark all as read
                </button>
              </div>
              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-icon">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">New deal closed</div>
                    <div className="notification-message">
                      Deal "Enterprise Software License" was closed for $50,000
                    </div>
                    <div className="notification-time">2 hours ago</div>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">Task due today</div>
                    <div className="notification-message">
                      Follow up with John Smith about proposal
                    </div>
                    <div className="notification-time">4 hours ago</div>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">New contact added</div>
                    <div className="notification-message">
                      Sarah Johnson from TechCorp was added to your contacts
                    </div>
                    <div className="notification-time">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 