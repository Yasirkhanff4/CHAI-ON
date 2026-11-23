import { expect, test } from '@playwright/test'
import { expectNoBrokenImages, expectNoConsoleErrors, watchConsole } from './helpers'

const PAGES = [
  { path: '/', heading: /chai break/i },
  { path: '/menu', heading: /Chai, coffee, nuggets/i },
  { path: '/contact', heading: /call the counter/i },
  { path: '/track', heading: /Where is your chai/i },
]

for (const target of PAGES) {
  test(`loads ${target.path} cleanly`, async ({ page }) => {
    const errors = watchConsole(page)

    const response = await page.goto(target.path, { waitUntil: 'domcontentloaded' })
    expect(response?.status(), `${target.path} responded ${response?.status()}`).toBeLessThan(400)

    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('body')).toContainText(target.heading)

    await expectNoBrokenImages(page)
    await expectNoConsoleErrors(errors, target.path)
  })
}
