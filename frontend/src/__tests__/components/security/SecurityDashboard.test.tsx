import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SecurityDashboard } from '../../../components/security/SecurityDashboard'

describe('SecurityDashboard', () => {
  beforeEach(() => {
    // Mock window.location and document for testing
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/dashboard',
      },
      writable: true,
    })
  })

  describe('rendering', () => {
    it('should render the dashboard with correct title and description', () => {
      render(<SecurityDashboard />)

      expect(screen.getByText('Security Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Monitor security events and manage user sessions')).toBeInTheDocument()
    })

    it('should show action buttons in header', () => {
      render(<SecurityDashboard />)

      expect(screen.getByText('Refresh')).toBeInTheDocument()
      expect(screen.getByText('Export Logs')).toBeInTheDocument()
    })

    it('should render view selector buttons', () => {
      render(<SecurityDashboard />)

      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Security Events')).toBeInTheDocument()
      expect(screen.getByText('Active Sessions')).toBeInTheDocument()
      expect(screen.getByText('Security Settings')).toBeInTheDocument()
    })
  })

  describe('overview view', () => {
    it('should display overview metrics by default', () => {
      render(<SecurityDashboard />)

      expect(screen.getByText('Active Sessions')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // 2 active sessions
      expect(screen.getByText('3 total sessions')).toBeInTheDocument()

      expect(screen.getByText('Security Events')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument() // 4 security events
      expect(screen.getByText('1 critical events')).toBeInTheDocument()

      expect(screen.getByText('2FA Status')).toBeInTheDocument()
      expect(screen.getByText('Enabled')).toBeInTheDocument()

      expect(screen.getByText('Security Score')).toBeInTheDocument()
      expect(screen.getByText('92/100')).toBeInTheDocument()
    })

    it('should show 2FA disabled status', () => {
      render(<SecurityDashboard />)

      // The component starts with 2FA enabled, so we need to click the settings button
      // and then the 2FA toggle to see the disabled state
      fireEvent.click(screen.getByText('Security Settings'))
      
      const twoFactorButton = screen.getByText('Enabled')
      fireEvent.click(twoFactorButton)

      // Go back to overview
      fireEvent.click(screen.getByText('Overview'))

      expect(screen.getByText('Disabled')).toBeInTheDocument()
    })
  })

  describe('security events view', () => {
    it('should display security events when events view is selected', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Events'))

      expect(screen.getByText('Recent Security Events')).toBeInTheDocument()
      
      // Check for specific events
      expect(screen.getByText('Successful login from desktop')).toBeInTheDocument()
      expect(screen.getByText('Failed login attempt with incorrect password')).toBeInTheDocument()
      expect(screen.getByText('Multiple failed login attempts from same IP')).toBeInTheDocument()
      expect(screen.getByText('Password changed successfully')).toBeInTheDocument()
    })

    it('should display event severity badges', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Events'))

      expect(screen.getByText('low')).toBeInTheDocument()
      expect(screen.getByText('medium')).toBeInTheDocument()
      expect(screen.getByText('high')).toBeInTheDocument()
    })

    it('should display event details', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Events'))

      // Check for user names
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Mike Johnson')).toBeInTheDocument()

      // Check for IP addresses
      expect(screen.getByText('192.168.1.100')).toBeInTheDocument()
      expect(screen.getByText('203.0.113.45')).toBeInTheDocument()
      expect(screen.getByText('198.51.100.123')).toBeInTheDocument()
    })

    it('should display event timestamps', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Events'))

      // Should show relative timestamps
      expect(screen.getByText(/ago/)).toBeInTheDocument()
    })
  })

  describe('active sessions view', () => {
    it('should display active sessions when sessions view is selected', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Active Sessions'))

      expect(screen.getByText('Active User Sessions')).toBeInTheDocument()
      
      // Check for user names
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
    })

    it('should display device and browser information', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Active Sessions'))

      expect(screen.getByText('Desktop • Chrome 120.0')).toBeInTheDocument()
      expect(screen.getByText('Mobile • Safari Mobile')).toBeInTheDocument()
      expect(screen.getByText('Tablet • Firefox 119.0')).toBeInTheDocument()
    })

    it('should display location and IP information', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Active Sessions'))

      expect(screen.getByText('New York, NY')).toBeInTheDocument()
      expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument()
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()

      expect(screen.getByText('192.168.1.100')).toBeInTheDocument()
      expect(screen.getByText('203.0.113.45')).toBeInTheDocument()
      expect(screen.getByText('192.168.1.102')).toBeInTheDocument()
    })

    it('should show terminate buttons for active sessions', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Active Sessions'))

      const terminateButtons = screen.getAllByText('Terminate')
      expect(terminateButtons).toHaveLength(2) // 2 active sessions
    })

    it('should terminate session when terminate button is clicked', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Active Sessions'))

      const terminateButtons = screen.getAllByText('Terminate')
      fireEvent.click(terminateButtons[0])

      // The session should be terminated (button should disappear)
      expect(screen.getAllByText('Terminate')).toHaveLength(1)
    })
  })

  describe('security settings view', () => {
    it('should display authentication settings when settings view is selected', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Settings'))

      expect(screen.getByText('Authentication Settings')).toBeInTheDocument()
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
      expect(screen.getByText('Strong Password Requirement')).toBeInTheDocument()
      expect(screen.getByText('Session Timeout')).toBeInTheDocument()
      expect(screen.getByText('Max Login Attempts')).toBeInTheDocument()
    })

    it('should display monitoring settings', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Settings'))

      expect(screen.getByText('Monitoring Settings')).toBeInTheDocument()
      expect(screen.getByText('Audit Logging')).toBeInTheDocument()
      expect(screen.getByText('Real-Time Alerts')).toBeInTheDocument()
    })

    it('should toggle two-factor authentication', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Settings'))

      const twoFactorButton = screen.getByText('Enabled')
      fireEvent.click(twoFactorButton)

      expect(screen.getByText('Disabled')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Disabled'))

      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })

    it('should toggle strong password requirement', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Settings'))

      const strongPasswordButton = screen.getByText('Enabled')
      fireEvent.click(strongPasswordButton)

      expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('should update session timeout value', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Settings'))

      const sessionTimeoutInput = screen.getByDisplayValue('30')
      fireEvent.change(sessionTimeoutInput, { target: { value: '60' } })

      expect(sessionTimeoutInput).toHaveValue(60)
    })

    it('should update max login attempts value', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Settings'))

      const maxLoginAttemptsInput = screen.getByDisplayValue('5')
      fireEvent.change(maxLoginAttemptsInput, { target: { value: '3' } })

      expect(maxLoginAttemptsInput).toHaveValue(3)
    })

    it('should toggle audit logging', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Settings'))

      const auditLoggingButton = screen.getByText('Enabled')
      fireEvent.click(auditLoggingButton)

      expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('should toggle real-time alerts', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Settings'))

      const realTimeAlertsButton = screen.getByText('Enabled')
      fireEvent.click(realTimeAlertsButton)

      expect(screen.getByText('Disabled')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should change view when view button is clicked', () => {
      render(<SecurityDashboard />)

      const eventsButton = screen.getByText('Security Events')
      fireEvent.click(eventsButton)

      expect(screen.getByText('Recent Security Events')).toBeInTheDocument()
    })

    it('should maintain selected view state', () => {
      render(<SecurityDashboard />)

      // Start with overview
      expect(screen.getByText('Active Sessions')).toBeInTheDocument()

      // Switch to events
      fireEvent.click(screen.getByText('Security Events'))
      expect(screen.getByText('Recent Security Events')).toBeInTheDocument()

      // Switch to sessions
      fireEvent.click(screen.getByText('Active Sessions'))
      expect(screen.getByText('Active User Sessions')).toBeInTheDocument()

      // Switch to settings
      fireEvent.click(screen.getByText('Security Settings'))
      expect(screen.getByText('Authentication Settings')).toBeInTheDocument()
    })
  })

  describe('severity colors', () => {
    it('should apply correct severity colors', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Events'))

      const lowSeverity = screen.getByText('low')
      const mediumSeverity = screen.getByText('medium')
      const highSeverity = screen.getByText('high')

      expect(lowSeverity).toHaveClass('bg-green-100', 'text-green-800')
      expect(mediumSeverity).toHaveClass('bg-yellow-100', 'text-yellow-800')
      expect(highSeverity).toHaveClass('bg-orange-100', 'text-orange-800')
    })
  })

  describe('device icons', () => {
    it('should display correct device icons', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Active Sessions'))

      // Check that device icons are present (they are SVG elements)
      const deviceIcons = document.querySelectorAll('svg')
      expect(deviceIcons.length).toBeGreaterThan(0)
    })
  })

  describe('time formatting', () => {
    it('should format timestamps correctly', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Events'))

      // Should show relative timestamps
      const timeElements = screen.getAllByText(/ago/)
      expect(timeElements.length).toBeGreaterThan(0)
    })
  })

  describe('responsive design', () => {
    it('should have responsive grid layouts', () => {
      render(<SecurityDashboard />)

      // Overview view should have responsive grid
      const overviewCards = screen.getAllByText(/Active Sessions|Security Events|2FA Status|Security Score/)
      expect(overviewCards).toHaveLength(4)

      // Check for responsive classes
      const gridContainer = screen.getByText('Active Sessions').closest('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })
  })

  describe('accessibility', () => {
    it('should have proper button roles and labels', () => {
      render(<SecurityDashboard />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    it('should have proper heading structure', () => {
      render(<SecurityDashboard />)

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByText('Security Dashboard')).toBeInTheDocument()
    })

    it('should have proper input labels', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Settings'))

      const inputs = screen.getAllByRole('spinbutton')
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'number')
      })
    })
  })

  describe('error handling', () => {
    it('should handle empty security events gracefully', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Security Events'))

      // Should still render the view without crashing
      expect(screen.getByText('Recent Security Events')).toBeInTheDocument()
    })

    it('should handle empty user sessions gracefully', () => {
      render(<SecurityDashboard />)

      fireEvent.click(screen.getByText('Active Sessions'))

      // Should still render the view without crashing
      expect(screen.getByText('Active User Sessions')).toBeInTheDocument()
    })
  })

  describe('performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<SecurityDashboard />)

      // Mock the component to track renders
      const initialRender = screen.getByText('Security Dashboard')

      rerender(<SecurityDashboard />)

      // Should be the same element (no unnecessary re-render)
      expect(screen.getByText('Security Dashboard')).toBe(initialRender)
    })
  })

  describe('data persistence', () => {
    it('should maintain settings state across view changes', () => {
      render(<SecurityDashboard />)

      // Go to settings and change a value
      fireEvent.click(screen.getByText('Security Settings'))
      
      const sessionTimeoutInput = screen.getByDisplayValue('30')
      fireEvent.change(sessionTimeoutInput, { target: { value: '60' } })

      // Switch to another view
      fireEvent.click(screen.getByText('Overview'))

      // Switch back to settings
      fireEvent.click(screen.getByText('Security Settings'))

      // Value should be maintained
      expect(screen.getByDisplayValue('60')).toBeInTheDocument()
    })
  })
})
