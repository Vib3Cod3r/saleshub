import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test('dashboard loads with all components', async ({ page }) => {
    await page.goto('/dashboard')

    // Should show dashboard title
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()

    // Should show stats cards
    await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4)
    
    // Should show recent activity
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible()
    
    // Should show navigation sidebar
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    
    // Should show header
    await expect(page.locator('[data-testid="header"]')).toBeVisible()
  })

  test('dashboard stats are displayed correctly', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for stats to load
    await page.waitForSelector('[data-testid="stats-card"]')

    // Check that stats cards contain expected data
    const statsCards = page.locator('[data-testid="stats-card"]')
    
    // Should show total contacts
    await expect(statsCards.nth(0)).toContainText('Contacts')
    
    // Should show total companies
    await expect(statsCards.nth(1)).toContainText('Companies')
    
    // Should show total deals
    await expect(statsCards.nth(2)).toContainText('Deals')
    
    // Should show total revenue
    await expect(statsCards.nth(3)).toContainText('Revenue')
  })

  test('recent activity is displayed', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for activity to load
    await page.waitForSelector('[data-testid="recent-activity"]')

    // Should show activity items
    const activityItems = page.locator('[data-testid="activity-item"]')
    await expect(activityItems).toHaveCount.greaterThan(0)
  })

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/dashboard')

    // Click on Contacts link
    await page.click('[data-testid="nav-contacts"]')
    await expect(page).toHaveURL('/contacts')

    // Click on Companies link
    await page.click('[data-testid="nav-companies"]')
    await expect(page).toHaveURL('/companies')

    // Click on Dashboard link
    await page.click('[data-testid="nav-dashboard"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('search functionality works', async ({ page }) => {
    await page.goto('/dashboard')

    // Find search input in header
    const searchInput = page.locator('[data-testid="search-input"]')
    await expect(searchInput).toBeVisible()

    // Type in search
    await searchInput.fill('test search')
    await searchInput.press('Enter')

    // Should navigate to search results or show search suggestions
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
  })

  test('user profile menu works', async ({ page }) => {
    await page.goto('/dashboard')

    // Click on user profile menu
    await page.click('[data-testid="user-menu-button"]')
    
    // Should show user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    
    // Should show user name
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible()
    
    // Should show logout option
    await expect(page.locator('[data-testid="logout-option"]')).toBeVisible()
  })

  test('notifications are displayed', async ({ page }) => {
    await page.goto('/dashboard')

    // Click on notifications bell
    await page.click('[data-testid="notifications-button"]')
    
    // Should show notifications panel
    await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible()
  })

  test('dashboard is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')

    // Should show mobile menu button
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
    
    // Click mobile menu
    await page.click('[data-testid="mobile-menu-button"]')
    
    // Should show mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
  })

  test('dashboard performance is acceptable', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard')
    
    // Wait for dashboard to be fully loaded
    await page.waitForSelector('[data-testid="dashboard-title"]')
    await page.waitForSelector('[data-testid="stats-card"]')
    await page.waitForSelector('[data-testid="recent-activity"]')
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('real-time updates work', async ({ page }) => {
    await page.goto('/dashboard')

    // Should show connection status
    await expect(page.locator('[data-testid="connection-status"]')).toBeVisible()
    
    // Should show connected status
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected')
  })

  test('dashboard handles errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/dashboard/stats', route => route.abort())
    
    await page.goto('/dashboard')

    // Should show error message
    await expect(page.locator('text=Failed to load dashboard data')).toBeVisible()
    
    // Should show retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('dashboard accessibility features work', async ({ page }) => {
    await page.goto('/dashboard')

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    
    // Should focus on first interactive element
    await expect(page.locator('[data-testid="sidebar"]')).toBeFocused()
    
    // Test screen reader support
    await expect(page.locator('[data-testid="dashboard-title"]')).toHaveAttribute('aria-label')
  })
})
