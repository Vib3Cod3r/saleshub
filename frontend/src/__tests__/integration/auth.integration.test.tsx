import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../../contexts/AuthContext'
import LoginPage from '../../../app/login/page'
import DashboardPage from '../../../app/dashboard/page'
import { useRouter } from 'next/navigation'

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

describe('Authentication Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
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

  describe('Login Flow', () => {
    it('should complete full login flow successfully', async () => {
      renderWithProviders(<LoginPage />)

      // Fill in login form
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password' } })
      fireEvent.click(loginButton)

      // Wait for authentication to complete
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should handle invalid credentials', async () => {
      renderWithProviders(<LoginPage />)

      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(loginButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })

      // Should not redirect
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should handle network errors during login', async () => {
      // Mock network error
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      renderWithProviders(<LoginPage />)

      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password' } })
      fireEvent.click(loginButton)

      // Should show network error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Session Management', () => {
    it('should maintain session state across page reloads', async () => {
      // Mock localStorage with existing session
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'admin@example.com',
      }
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', 'mock-jwt-token')

      renderWithProviders(<DashboardPage />)

      // Should automatically authenticate with stored session
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    })

    it('should redirect to login when session expires', async () => {
      // Mock expired token
      localStorage.setItem('token', 'expired-token')

      renderWithProviders(<DashboardPage />)

      // Should redirect to login
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Logout Flow', () => {
    it('should complete logout flow successfully', async () => {
      // Start with authenticated state
      localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test User' }))
      localStorage.setItem('token', 'mock-jwt-token')

      renderWithProviders(<DashboardPage />)

      // Find and click logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i })
      fireEvent.click(logoutButton)

      // Should clear session and redirect to login
      await waitFor(() => {
        expect(localStorage.getItem('user')).toBeNull()
        expect(localStorage.getItem('token')).toBeNull()
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Protected Routes', () => {
    it('should protect dashboard route from unauthenticated access', async () => {
      // Clear any existing session
      localStorage.clear()

      renderWithProviders(<DashboardPage />)

      // Should redirect to login
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })

    it('should allow access to dashboard when authenticated', async () => {
      // Mock authenticated state
      localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test User' }))
      localStorage.setItem('token', 'mock-jwt-token')

      renderWithProviders(<DashboardPage />)

      // Should show dashboard content
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      renderWithProviders(<LoginPage />)

      const loginButton = screen.getByRole('button', { name: /login/i })
      fireEvent.click(loginButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      renderWithProviders(<LoginPage />)

      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password' } })
      fireEvent.click(loginButton)

      // Should show email validation error
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during authentication', async () => {
      // Mock slow network response
      global.fetch = jest.fn(() =>
        new Promise(resolve =>
          setTimeout(() =>
            resolve({
              ok: true,
              json: () => Promise.resolve({ user: { id: '1', name: 'Test User' } }),
            }),
            1000
          )
        )
      )

      renderWithProviders(<LoginPage />)

      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password' } })
      fireEvent.click(loginButton)

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(loginButton).toBeDisabled()
    })
  })
})
