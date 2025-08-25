import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Navigate to dashboard and logout
  await page.goto(`${config.projects[0].use.baseURL}/dashboard`)
  
  // Click logout button if available
  const logoutButton = page.locator('[data-testid="logout-button"]')
  if (await logoutButton.isVisible()) {
    await logoutButton.click()
    await page.waitForURL(`${config.projects[0].use.baseURL}/login`)
  }

  await browser.close()
}

export default globalTeardown
