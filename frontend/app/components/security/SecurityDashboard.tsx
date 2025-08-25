'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  Users,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  LogOut,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'permission_change' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: string
  userId: string
  userName: string
  ipAddress: string
  userAgent: string
  location: string
}

interface UserSession {
  id: string
  userId: string
  userName: string
  device: string
  browser: string
  ipAddress: string
  location: string
  lastActivity: string
  isActive: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  passwordExpiryDays: number
  sessionTimeoutMinutes: number
  maxLoginAttempts: number
  ipWhitelist: string[]
  requireStrongPassword: boolean
  enableAuditLog: boolean
  enableRealTimeAlerts: boolean
}

export function SecurityDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [userSessions, setUserSessions] = useState<UserSession[]>([])
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    passwordExpiryDays: 90,
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    requireStrongPassword: true,
    enableAuditLog: true,
    enableRealTimeAlerts: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [selectedView, setSelectedView] = useState<'overview' | 'events' | 'sessions' | 'settings'>('overview')

  // Simulate security events
  useEffect(() => {
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login',
        severity: 'low',
        description: 'Successful login from desktop',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        userId: 'user1',
        userName: 'John Doe',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'New York, NY',
      },
      {
        id: '2',
        type: 'failed_login',
        severity: 'medium',
        description: 'Failed login attempt with incorrect password',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        userId: 'user2',
        userName: 'Jane Smith',
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        location: 'Unknown',
      },
      {
        id: '3',
        type: 'suspicious_activity',
        severity: 'high',
        description: 'Multiple failed login attempts from same IP',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        userId: 'unknown',
        userName: 'Unknown User',
        ipAddress: '198.51.100.123',
        userAgent: 'Mozilla/5.0 (compatible; Bot)',
        location: 'Unknown',
      },
      {
        id: '4',
        type: 'password_change',
        severity: 'low',
        description: 'Password changed successfully',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        userId: 'user3',
        userName: 'Mike Johnson',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
        location: 'San Francisco, CA',
      },
    ]
    setSecurityEvents(mockEvents)
  }, [])

  // Simulate user sessions
  useEffect(() => {
    const mockSessions: UserSession[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        device: 'Desktop',
        browser: 'Chrome 120.0',
        ipAddress: '192.168.1.100',
        location: 'New York, NY',
        lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        isActive: true,
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Jane Smith',
        device: 'Mobile',
        browser: 'Safari Mobile',
        ipAddress: '203.0.113.45',
        location: 'Los Angeles, CA',
        lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        isActive: true,
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Mike Johnson',
        device: 'Tablet',
        browser: 'Firefox 119.0',
        ipAddress: '192.168.1.102',
        location: 'San Francisco, CA',
        lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isActive: false,
      },
    ]
    setUserSessions(mockSessions)
  }, [])

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'logout':
        return <LogOut className="w-4 h-4 text-blue-600" />
      case 'failed_login':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'password_change':
        return <Lock className="w-4 h-4 text-yellow-600" />
      case 'permission_change':
        return <Settings className="w-4 h-4 text-purple-600" />
      case 'suspicious_activity':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Shield className="w-4 h-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const terminateSession = (sessionId: string) => {
    setUserSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, isActive: false } : session
    ))
  }

  const updateSecuritySetting = (key: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }))
  }

  const views = [
    { value: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { value: 'events', label: 'Security Events', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'sessions', label: 'Active Sessions', icon: <Users className="w-4 h-4" /> },
    { value: 'settings', label: 'Security Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  const activeSessions = userSessions.filter(session => session.isActive)
  const criticalEvents = securityEvents.filter(event => event.severity === 'critical' || event.severity === 'high')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600">Monitor security events and manage user sessions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            leftIcon={<RefreshCw />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download />}
          >
            Export Logs
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-1">
            {views.map((view) => (
              <Button
                key={view.value}
                variant={selectedView === view.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView(view.value as any)}
                leftIcon={view.icon}
              >
                {view.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview Dashboard */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Sessions</span>
                <Users className="w-4 h-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {activeSessions.length}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {userSessions.length} total sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Security Events</span>
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {securityEvents.length}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {criticalEvents.length} critical events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>2FA Status</span>
                {securitySettings.twoFactorEnabled ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Two-factor authentication
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Security Score</span>
                <Shield className="w-4 h-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                92/100
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Excellent security posture
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Events */}
      {selectedView === 'events' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {event.description}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{event.userName}</span>
                      <span>{event.ipAddress}</span>
                      <span>{event.location}</span>
                      <span>{formatTimeAgo(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      {selectedView === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle>Active User Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.device)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {session.userName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {session.device} • {session.browser}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{session.location}</span>
                      </div>
                      <div>{session.ipAddress}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(session.lastActivity)}
                    </span>
                    {session.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                      >
                        Terminate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      {selectedView === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Button
                    variant={securitySettings.twoFactorEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSecuritySetting('twoFactorEnabled', !securitySettings.twoFactorEnabled)}
                  >
                    {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Strong Password Requirement</h4>
                    <p className="text-sm text-gray-500">Require complex passwords</p>
                  </div>
                  <Button
                    variant={securitySettings.requireStrongPassword ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSecuritySetting('requireStrongPassword', !securitySettings.requireStrongPassword)}
                  >
                    {securitySettings.requireStrongPassword ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Session Timeout</h4>
                    <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeoutMinutes}
                    onChange={(e) => updateSecuritySetting('sessionTimeoutMinutes', parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Max Login Attempts</h4>
                    <p className="text-sm text-gray-500">Before account lockout</p>
                  </div>
                  <Input
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monitoring Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Audit Logging</h4>
                    <p className="text-sm text-gray-500">Log all security events</p>
                  </div>
                  <Button
                    variant={securitySettings.enableAuditLog ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSecuritySetting('enableAuditLog', !securitySettings.enableAuditLog)}
                  >
                    {securitySettings.enableAuditLog ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Real-Time Alerts</h4>
                    <p className="text-sm text-gray-500">Immediate security notifications</p>
                  </div>
                  <Button
                    variant={securitySettings.enableRealTimeAlerts ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSecuritySetting('enableRealTimeAlerts', !securitySettings.enableRealTimeAlerts)}
                  >
                    {securitySettings.enableRealTimeAlerts ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
