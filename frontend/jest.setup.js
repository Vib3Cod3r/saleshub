import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/dashboard'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = WebSocket.CONNECTING
    this.onopen = null
    this.onclose = null
    this.onmessage = null
    this.onerror = null
    
    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN
      if (this.onopen) this.onopen()
    }, 100)
  }
  
  send(data) {
    if (this.onmessage) {
      this.onmessage({ data })
    }
  }
  
  close() {
    this.readyState = WebSocket.CLOSED
    if (this.onclose) this.onclose()
  }
}

WebSocket.CONNECTING = 0
WebSocket.OPEN = 1
WebSocket.CLOSING = 2
WebSocket.CLOSED = 3

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock document.createElement for download functionality
const originalCreateElement = document.createElement
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    }
  }
  return originalCreateElement.call(document, tagName)
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
)

// Mock toast notifications
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
}

jest.mock('react-hot-toast', () => ({
  toast: mockToast,
  default: mockToast,
}))

// Make toast available globally for tests
global.toast = mockToast

// Mock lib/utils
jest.mock('./src/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
  formatDate: jest.fn((date) => date.toISOString()),
  formatCurrency: jest.fn((amount) => `$${amount.toFixed(2)}`),
  debounce: jest.fn((func, delay) => func),
  throttle: jest.fn((func, delay) => func),
}))

// Mock UI components
jest.mock('./src/components/ui/Card', () => ({
  Card: ({ children, ...props }) => <div data-testid="card" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }) => <h3 data-testid="card-title" {...props}>{children}</h3>,
  CardDescription: ({ children, ...props }) => <p data-testid="card-description" {...props}>{children}</p>,
  CardContent: ({ children, ...props }) => <div data-testid="card-content" {...props}>{children}</div>,
  CardFooter: ({ children, ...props }) => <div data-testid="card-footer" {...props}>{children}</div>,
}))

jest.mock('./src/components/ui/Button', () => ({
  Button: ({ children, ...props }) => <button data-testid="button" {...props}>{children}</button>,
}))

jest.mock('./src/components/ui/Input', () => ({
  Input: ({ ...props }) => <input data-testid="input" {...props} />,
}))

jest.mock('./src/components/ui/Modal', () => ({
  Modal: ({ children, ...props }) => <div data-testid="modal" {...props}>{children}</div>,
  ModalContent: ({ children, ...props }) => <div data-testid="modal-content" {...props}>{children}</div>,
  ModalHeader: ({ children, ...props }) => <div data-testid="modal-header" {...props}>{children}</div>,
  ModalBody: ({ children, ...props }) => <div data-testid="modal-body" {...props}>{children}</div>,
  ModalFooter: ({ children, ...props }) => <div data-testid="modal-footer" {...props}>{children}</div>,
}))

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => fn),
    formState: { errors: {} },
    watch: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
    reset: jest.fn(),
  })),
}))

// Mock @hookform/resolvers
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => jest.fn()),
}))

// Mock TanStack React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
    data: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }) => children,
}))

// Mock API hooks
jest.mock('./src/hooks/api/useApi', () => ({
  useContacts: jest.fn(() => ({
    data: [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
    ],
    isLoading: false,
    error: null,
  })),
  useCreateContact: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useUpdateContact: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useDeleteContact: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useCompanies: jest.fn(() => ({
    data: [
      { id: '1', name: 'Test Company 1' },
      { id: '2', name: 'Test Company 2' },
    ],
    isLoading: false,
    error: null,
  })),
  useCreateCompany: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useUpdateCompany: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useDeleteCompany: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useDashboardStats: jest.fn(() => ({
    data: {
      totalContacts: 1250,
      totalCompanies: 89,
      totalDeals: 234,
      totalRevenue: 1250000,
    },
    isLoading: false,
    error: null,
  })),
  useRecentActivity: jest.fn(() => ({
    data: [
      { id: '1', type: 'contact_created', description: 'New contact added' },
      { id: '2', type: 'deal_closed', description: 'Deal closed' },
    ],
    isLoading: false,
    error: null,
  })),
  useApi: jest.fn(),
  useMutationApi: jest.fn(),
}))

// Mock real-time hooks
jest.mock('./src/hooks/useRealtimeDashboard', () => ({
  useRealtimeDashboard: jest.fn(() => ({
    stats: {
      totalContacts: 1250,
      totalCompanies: 89,
      totalDeals: 234,
      totalRevenue: 1250000,
    },
    recentActivity: [
      { id: '1', type: 'contact_created', description: 'New contact added' },
      { id: '2', type: 'deal_closed', description: 'Deal closed' },
    ],
    isConnected: true,
  })),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Mock date for consistent testing
const mockDate = new Date('2024-12-19T10:00:00.000Z')
global.Date = jest.fn(() => mockDate)
global.Date.now = jest.fn(() => mockDate.getTime())

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

afterEach(() => {
  jest.clearAllTimers()
})

// Global test utilities
global.testUtils = {
  waitForElementToBeRemoved: (element) => {
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        if (!document.contains(element)) {
          observer.disconnect()
          resolve()
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
    })
  },
  
  mockIntersectionObserver: (entries = []) => {
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver
    
    // Trigger intersection observer callback
    setTimeout(() => {
      const observer = mockIntersectionObserver.mock.results[0].value
      if (observer.callback) {
        observer.callback(entries)
      }
    }, 0)
  },
  
  mockResizeObserver: () => {
    const mockResizeObserver = jest.fn()
    mockResizeObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.ResizeObserver = mockResizeObserver
  },
}
