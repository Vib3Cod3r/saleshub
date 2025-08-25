# SalesHub CRM Testing Guide

## 📋 Overview

This guide covers all testing aspects of the SalesHub CRM application, including unit tests, integration tests, end-to-end tests, and performance testing.

## 🎯 Testing Strategy

### **Test Pyramid**
- **Unit Tests**: 70% - Individual components and functions
- **Integration Tests**: 20% - Component interactions and API integration
- **E2E Tests**: 10% - Complete user workflows

### **Testing Goals**
- **Coverage**: Maintain 80%+ code coverage
- **Performance**: < 2s dashboard load, < 500ms search
- **Reliability**: 95%+ test pass rate
- **Maintainability**: Clear, readable, and maintainable tests

---

## 🧪 Test Types

### **1. Unit Tests**
- **Location**: `src/__tests__/components/`, `src/__tests__/hooks/`
- **Framework**: Jest + React Testing Library
- **Coverage**: Individual components, hooks, utilities

### **2. Integration Tests**
- **Location**: `src/__tests__/integration/`
- **Framework**: Jest + React Testing Library
- **Coverage**: Component interactions, API workflows

### **3. End-to-End Tests**
- **Location**: `e2e/tests/`
- **Framework**: Playwright
- **Coverage**: Complete user journeys

### **4. Performance Tests**
- **Location**: `src/__tests__/utils/performance.test.ts`
- **Framework**: Jest + Custom utilities
- **Coverage**: Load times, memory usage, responsiveness

---

## 🚀 Running Tests

### **Unit & Integration Tests**
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run specific test file
npm test -- auth.integration.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Authentication"
```

### **E2E Tests**
```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run specific E2E test file
npm run test:e2e -- auth.spec.ts

# Run E2E tests on specific browser
npm run test:e2e -- --project=chromium

# Run E2E tests with debug
npm run test:e2e -- --debug
```

### **Performance Tests**
```bash
# Run performance tests
npm run test:performance

# Run performance benchmarks
npm run test:benchmark
```

---

## 📁 Test Structure

```
frontend/
├── src/
│   └── __tests__/
│       ├── components/           # Unit tests for components
│       │   ├── ui/              # UI component tests
│       │   ├── auth/            # Authentication tests
│       │   ├── contacts/        # Contact management tests
│       │   └── dashboard/       # Dashboard tests
│       ├── hooks/               # Hook tests
│       ├── integration/         # Integration tests
│       │   ├── auth.integration.test.tsx
│       │   ├── contacts.integration.test.tsx
│       │   └── dashboard.integration.test.tsx
│       └── utils/               # Test utilities
│           └── performance.test.ts
├── e2e/
│   ├── tests/                   # E2E test files
│   │   ├── auth.spec.ts
│   │   ├── dashboard.spec.ts
│   │   └── contacts.spec.ts
│   ├── utils/                   # E2E utilities
│   ├── global-setup.ts          # Global setup
│   └── global-teardown.ts       # Global teardown
└── docs/
    └── testing-guide.md         # This file
```

---

## 🧩 Test Patterns

### **Component Testing Pattern**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ComponentName } from '../ComponentName'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    render(<ComponentName />)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Updated Text')).toBeInTheDocument()
    })
  })

  it('should handle errors gracefully', async () => {
    render(<ComponentName />)
    
    // Trigger error condition
    fireEvent.click(screen.getByRole('button', { name: /error/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })
})
```

### **Hook Testing Pattern**
```typescript
import { renderHook, act } from '@testing-library/react'
import { useCustomHook } from '../useCustomHook'

describe('useCustomHook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCustomHook())
    
    expect(result.current.value).toBe('default')
  })

  it('should update state when action is called', () => {
    const { result } = renderHook(() => useCustomHook())
    
    act(() => {
      result.current.updateValue('new value')
    })
    
    expect(result.current.value).toBe('new value')
  })
})
```

### **Integration Testing Pattern**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../../contexts/AuthContext'

describe('Feature Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    )
  }

  it('should complete full workflow', async () => {
    renderWithProviders(<FeatureComponent />)
    
    // Test complete workflow
    // 1. Initial state
    // 2. User interaction
    // 3. API call
    // 4. State update
    // 5. UI update
  })
})
```

### **E2E Testing Pattern**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature E2E', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test('should complete user journey', async ({ page }) => {
    await page.goto('/feature-page')
    
    // Test user interactions
    await page.click('[data-testid="action-button"]')
    
    // Verify results
    await expect(page.locator('[data-testid="result"]')).toBeVisible()
  })
})
```

---

## 🔧 Test Configuration

### **Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### **Playwright Configuration**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

---

## 📊 Coverage Requirements

### **Minimum Coverage Thresholds**
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### **Critical Paths (100% Coverage Required)**
- Authentication flows
- Contact CRUD operations
- Dashboard data loading
- Real-time updates
- Error handling

### **Coverage Reports**
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

---

## 🎯 Performance Benchmarks

### **Load Time Targets**
- **Dashboard**: < 2 seconds
- **Contacts Page**: < 1.5 seconds
- **Search**: < 500ms
- **Modal Open**: < 200ms
- **Form Validation**: < 100ms

### **Memory Usage Limits**
- **Initial Load**: < 50MB
- **After 10 Renders**: < 60MB
- **Memory Leak Test**: < 5MB increase

### **Network Performance**
- **API Response**: < 1 second
- **Real-time Updates**: < 300ms
- **Data Export**: < 1 second

---

## 🐛 Debugging Tests

### **Unit Test Debugging**
```bash
# Run specific test with debug output
npm test -- --verbose --testNamePattern="ComponentName"

# Run tests with console.log output
npm test -- --verbose --silent=false

# Debug failing test
npm test -- --runInBand --detectOpenHandles
```

### **E2E Test Debugging**
```bash
# Run E2E test in headed mode
npm run test:e2e -- --headed --project=chromium

# Run E2E test with debug
npm run test:e2e -- --debug

# Run E2E test with trace
npm run test:e2e -- --trace on

# View trace report
npx playwright show-trace trace.zip
```

### **Performance Test Debugging**
```bash
# Run performance test with detailed output
npm run test:performance -- --verbose

# Profile memory usage
npm run test:performance -- --profile-memory
```

---

## 🔄 CI/CD Integration

### **GitHub Actions Workflow**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:performance
```

### **Test Reports**
- **Coverage**: Uploaded to Codecov
- **E2E Results**: HTML report generated
- **Performance**: Benchmarks tracked over time

---

## 📝 Best Practices

### **Test Writing**
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test descriptions
3. **Single Responsibility**: Test one thing per test
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Execution**: Keep tests fast and efficient

### **Test Data**
1. **Use Factories**: Create test data factories
2. **Mock External Dependencies**: Mock APIs and services
3. **Clean State**: Reset state between tests
4. **Realistic Data**: Use realistic test data

### **Maintenance**
1. **Update Tests**: Keep tests in sync with code changes
2. **Remove Dead Tests**: Delete obsolete tests
3. **Refactor Tests**: Improve test quality over time
4. **Document Changes**: Update this guide when needed

---

## 🆘 Troubleshooting

### **Common Issues**

#### **Tests Failing Intermittently**
```bash
# Run tests with retries
npm test -- --retries=3

# Run tests in sequence
npm test -- --runInBand
```

#### **Memory Issues**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm test
```

#### **Timeout Issues**
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

#### **Mock Issues**
```bash
# Clear Jest cache
npm test -- --clearCache
```

### **Getting Help**
1. Check the test logs for error details
2. Review the test configuration
3. Consult the Jest/Playwright documentation
4. Ask in team discussions or code reviews

---

## 📚 Resources

### **Documentation**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)

### **Tools**
- [Jest Coverage](https://jestjs.io/docs/cli#--coverage)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

**Last Updated**: December 19, 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
