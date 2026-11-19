import { expect, test } from '@playwright/test'

// Each test gets a fresh context, so this is a true guest (no session at all).
for (const path of ['/admin', '/admin/orders']) {
  test(`guest: ${path} redirects to /admin/login`, async ({ page }) => {
    await page.goto(path)
    await page.waitForTimeout(5000)

    const landedOn = new URL(page.url()).pathname
    expect(landedOn, `guest visiting ${path} stayed on ${landedOn}`).toBe('/admin/login')
    await expect(page.locator('body')).toContainText(/staff|admin/i)
  })
}

test('guest: the admin login screen renders its form', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.locator('#adminEmail')).toBeVisible()
  await expect(page.locator('#adminPassword')).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})
