import { test, expect } from '@playwright/test'

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies()
  })

  test('user can login and access dashboard', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Should show dashboard content
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('user cannot login with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill login form with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')

    // Should stay on login page
    await expect(page).toHaveURL('/login')
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('user cannot access dashboard without authentication', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('user can logout successfully', async ({ page, context }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')

    // Click logout button
    await page.click('[data-testid="logout-button"]')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
    
    // Should not be able to access dashboard
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('form validation works correctly', async ({ page }) => {
    await page.goto('/login')

    // Try to submit empty form
    await page.click('[data-testid="login-button"]')

    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()

    // Fill only email
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="login-button"]')

    // Should still show password error
    await expect(page.locator('text=Password is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).not.toBeVisible()
  })

  test('email format validation works', async ({ page }) => {
    await page.goto('/login')

    // Enter invalid email format
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')

    // Should show email format error
    await expect(page.locator('text=Invalid email format')).toBeVisible()
  })

  test('loading state is shown during login', async ({ page }) => {
    await page.goto('/login')

    // Fill form and submit
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')

    // Should show loading state briefly
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled()
    await expect(page.locator('text=Loading')).toBeVisible()
  })

  test('session persists across page reloads', async ({ page, context }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')

    // Reload page
    await page.reload()

    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible()
  })
})
