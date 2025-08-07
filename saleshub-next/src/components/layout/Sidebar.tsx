'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser, useLogout } from '@/lib/hooks';
import { 
  LayoutDashboard, 
  Handshake, 
  Users, 
  CheckSquare, 
  GitBranch, 
  MessageSquare, 
  Settings,
  LogOut,
  Building
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, error } = useCurrentUser();
  const logoutMutation = useLogout();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { id: 'deals', label: 'Deals', icon: Handshake, href: '/deals' },
    { id: 'contacts', label: 'Contacts', icon: Users, href: '/contacts' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, href: '/tasks' },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch, href: '/pipeline' },
    { id: 'communications', label: 'Communications', icon: MessageSquare, href: '/communications' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = () => {
    if (!user || error) return 'G';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getCurrentPage = () => {
    if (pathname === '/') return 'dashboard';
    return pathname.slice(1); // Remove leading slash
  };

  return (
    <aside className={`sidebar ${className} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo">
          <Building className="h-6 w-6 text-white" />
          {!isCollapsed && <span className="logo-text">Sales CRM</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = getCurrentPage() === item.id;
            
            return (
              <li key={item.id} className={`nav-item ${isActive ? 'active' : ''}`}>
                <button
                  onClick={() => router.push(item.href)}
                  className="nav-link"
                >
                  <Icon className="nav-icon" />
                  {!isCollapsed && <span className="nav-text">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

            {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <span className="user-initials">{getUserInitials()}</span>
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">
                {isLoading ? 'Loading...' : error ? 'Guest' : (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User')}
              </div>
              <div className="user-role">
                {isLoading ? 'Loading...' : error ? 'Not signed in' : (user?.role?.replace('_', ' ') || 'User')}
              </div>
            </div>
          )}
          <button 
            className="logout-btn"
            onClick={handleLogout}
            disabled={logoutMutation.isPending || isLoading}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
} 