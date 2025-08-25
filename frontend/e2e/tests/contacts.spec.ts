import { test, expect } from '@playwright/test'

test.describe('Contacts E2E', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test('contacts page loads with contact list', async ({ page }) => {
    await page.goto('/contacts')

    // Should show contacts page title
    await expect(page.locator('[data-testid="contacts-title"]')).toBeVisible()
    await expect(page.locator('text=Contacts')).toBeVisible()

    // Should show contact list
    await expect(page.locator('[data-testid="contact-list"]')).toBeVisible()
    
    // Should show add contact button
    await expect(page.locator('[data-testid="add-contact-button"]')).toBeVisible()
    
    // Should show search input
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
  })

  test('user can create a new contact', async ({ page }) => {
    await page.goto('/contacts')

    // Click add contact button
    await page.click('[data-testid="add-contact-button"]')

    // Should open create contact modal
    await expect(page.locator('[data-testid="contact-modal"]')).toBeVisible()
    await expect(page.locator('text=Create Contact')).toBeVisible()

    // Fill contact form
    await page.fill('[data-testid="first-name-input"]', 'John')
    await page.fill('[data-testid="last-name-input"]', 'Doe')
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com')
    await page.fill('[data-testid="phone-input"]', '+1234567890')

    // Select company
    await page.selectOption('[data-testid="company-select"]', '1')

    // Add tags
    await page.fill('[data-testid="tags-input"]', 'lead')
    await page.keyboard.press('Enter')

    // Submit form
    await page.click('[data-testid="create-button"]')

    // Should close modal and show success message
    await expect(page.locator('[data-testid="contact-modal"]')).not.toBeVisible()
    await expect(page.locator('text=Contact created successfully')).toBeVisible()

    // Should show new contact in list
    await expect(page.locator('text=John Doe')).toBeVisible()
  })

  test('user can edit an existing contact', async ({ page }) => {
    await page.goto('/contacts')

    // Wait for contacts to load
    await page.waitForSelector('[data-testid="contact-item"]')

    // Click edit button on first contact
    await page.click('[data-testid="edit-contact-button"]').first()

    // Should open edit modal
    await expect(page.locator('[data-testid="contact-modal"]')).toBeVisible()
    await expect(page.locator('text=Edit Contact')).toBeVisible()

    // Update contact information
    await page.fill('[data-testid="first-name-input"]', 'Updated')
    await page.fill('[data-testid="last-name-input"]', 'Contact')

    // Submit form
    await page.click('[data-testid="update-button"]')

    // Should close modal and show success message
    await expect(page.locator('[data-testid="contact-modal"]')).not.toBeVisible()
    await expect(page.locator('text=Contact updated successfully')).toBeVisible()

    // Should show updated contact in list
    await expect(page.locator('text=Updated Contact')).toBeVisible()
  })

  test('user can delete a contact', async ({ page }) => {
    await page.goto('/contacts')

    // Wait for contacts to load
    await page.waitForSelector('[data-testid="contact-item"]')

    // Click delete button on first contact
    await page.click('[data-testid="delete-contact-button"]').first()

    // Should show confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible()
    await expect(page.locator('text=Are you sure you want to delete this contact?')).toBeVisible()

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]')

    // Should show success message
    await expect(page.locator('text=Contact deleted successfully')).toBeVisible()
  })

  test('contact search functionality works', async ({ page }) => {
    await page.goto('/contacts')

    // Type in search input
    await page.fill('[data-testid="search-input"]', 'John')

    // Should filter contacts
    await expect(page.locator('text=John')).toBeVisible()
    
    // Clear search
    await page.fill('[data-testid="search-input"]', '')
    
    // Should show all contacts
    await expect(page.locator('[data-testid="contact-item"]')).toHaveCount.greaterThan(0)
  })

  test('advanced filtering works', async ({ page }) => {
    await page.goto('/contacts')

    // Open advanced filters
    await page.click('[data-testid="filters-button"]')

    // Should show filters panel
    await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible()

    // Filter by status
    await page.selectOption('[data-testid="status-filter"]', 'active')

    // Filter by company
    await page.selectOption('[data-testid="company-filter"]', '1')

    // Apply filters
    await page.click('[data-testid="apply-filters-button"]')

    // Should show filtered results
    await expect(page.locator('[data-testid="contact-item"]')).toHaveCount.greaterThan(0)
  })

  test('contact form validation works', async ({ page }) => {
    await page.goto('/contacts')

    // Click add contact button
    await page.click('[data-testid="add-contact-button"]')

    // Try to submit empty form
    await page.click('[data-testid="create-button"]')

    // Should show validation errors
    await expect(page.locator('text=First name is required')).toBeVisible()
    await expect(page.locator('text=Last name is required')).toBeVisible()

    // Fill only first name
    await page.fill('[data-testid="first-name-input"]', 'John')
    await page.click('[data-testid="create-button"]')

    // Should still show last name error
    await expect(page.locator('text=Last name is required')).toBeVisible()
    await expect(page.locator('text=First name is required')).not.toBeVisible()
  })

  test('contact export functionality works', async ({ page }) => {
    await page.goto('/contacts')

    // Click export button
    await page.click('[data-testid="export-button"]')

    // Should open export modal
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible()
    await expect(page.locator('text=Export Data')).toBeVisible()

    // Select CSV format
    await page.click('[data-testid="csv-option"]')

    // Select fields to export
    await page.click('[data-testid="name-checkbox"]')
    await page.click('[data-testid="email-checkbox"]')

    // Export data
    await page.click('[data-testid="export-data-button"]')

    // Should show export completed message
    await expect(page.locator('text=Export completed')).toBeVisible()
  })

  test('contact list pagination works', async ({ page }) => {
    await page.goto('/contacts')

    // Should show pagination controls
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible()

    // Click next page
    await page.click('[data-testid="next-page-button"]')

    // Should show different contacts
    await expect(page.locator('[data-testid="contact-item"]')).toHaveCount.greaterThan(0)

    // Click previous page
    await page.click('[data-testid="prev-page-button"]')

    // Should return to first page
    await expect(page.locator('[data-testid="page-1-button"]')).toHaveClass(/active/)
  })

  test('contact list sorting works', async ({ page }) => {
    await page.goto('/contacts')

    // Click on name column header to sort
    await page.click('[data-testid="name-column-header"]')

    // Should sort contacts by name
    await expect(page.locator('[data-testid="name-column-header"]')).toHaveClass(/sorted/)

    // Click again to reverse sort
    await page.click('[data-testid="name-column-header"]')

    // Should reverse sort
    await expect(page.locator('[data-testid="name-column-header"]')).toHaveClass(/reverse/)
  })

  test('contact list handles large datasets', async ({ page }) => {
    await page.goto('/contacts')

    // Should load contacts efficiently
    await page.waitForSelector('[data-testid="contact-item"]')

    // Should show virtualized list for performance
    const contactItems = page.locator('[data-testid="contact-item"]')
    await expect(contactItems).toHaveCount.greaterThan(0)

    // Scroll to load more contacts
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Should load more contacts
    await page.waitForTimeout(1000)
  })

  test('contact list is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/contacts')

    // Should show mobile-optimized layout
    await expect(page.locator('[data-testid="mobile-contact-list"]')).toBeVisible()

    // Should show mobile menu for actions
    await page.click('[data-testid="contact-item"]').first()
    await expect(page.locator('[data-testid="mobile-action-menu"]')).toBeVisible()
  })

  test('contact list accessibility features work', async ({ page }) => {
    await page.goto('/contacts')

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    
    // Should focus on first interactive element
    await expect(page.locator('[data-testid="add-contact-button"]')).toBeFocused()

    // Test screen reader support
    await expect(page.locator('[data-testid="contact-list"]')).toHaveAttribute('aria-label')
    
    // Test ARIA labels on buttons
    await expect(page.locator('[data-testid="edit-contact-button"]')).toHaveAttribute('aria-label')
    await expect(page.locator('[data-testid="delete-contact-button"]')).toHaveAttribute('aria-label')
  })
})
