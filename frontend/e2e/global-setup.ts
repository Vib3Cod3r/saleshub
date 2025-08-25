import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use

  // Setup authentication state
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Navigate to login page
  await page.goto(`${baseURL}/login`)

  // Login with test credentials
  await page.fill('[data-testid="email-input"]', 'admin@example.com')
  await page.fill('[data-testid="password-input"]', 'password')
  await page.click('[data-testid="login-button"]')

  // Wait for successful login and redirect
  await page.waitForURL(`${baseURL}/dashboard`)

  // Save signed-in state
  await page.context().storageState({ path: storageState as string })
  await browser.close()
}

export default globalSetup
