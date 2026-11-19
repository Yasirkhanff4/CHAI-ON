import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end checks against the LIVE deployment. No web server is started:
 * the suite points at the public URL (override with CHAION_URL).
 */
const baseURL = process.env.CHAION_URL ?? 'https://chai-on.vercel.app'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  // The live app keeps cart/auth state per browser context; one worker keeps
  // the run deterministic and avoids duplicate live orders.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile-pixel-5', use: { ...devices['Pixel 5'] } },
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
})
