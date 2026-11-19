import { expect, test } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'
import { devices } from '@playwright/test'
import { newCredentials, readState, writeState } from './helpers'

/**
 * The full guest → account journey. It places exactly ONE live order, so it
 * runs on the mobile project only; the desktop project still covers the pages,
 * cart, checkout validation and the guest staff-guard redirect.
 *
 * Every test in this file shares one browser context so the anonymous Firebase
 * session created at guest checkout survives into registration: that is what
 * ties the order to the new account.
 */
const baseURL = process.env.CHAION_URL ?? 'https://chai-on.vercel.app'
const mobileOnly = 'Places the single live test order; runs on the mobile project only'

let context: BrowserContext
let page: Page

test.beforeAll(async ({ browser }, workerInfo) => {
  if (workerInfo.project.name !== 'mobile-pixel-5') return
  context = await browser.newContext({ ...devices['Pixel 5'], baseURL })
  page = await context.newPage()
})

test.afterAll(async () => {
  await context?.close()
})

test('guest: place one order, see the confirmation number, then track it', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-pixel-5', mobileOnly)
  test.setTimeout(180_000)

  // Two cups in the cart.
  await page.goto('/menu')
  const cards = page.getByRole('article')
  await cards.first().getByRole('button', { name: /^Add/ }).click()
  await cards.nth(1).getByRole('button', { name: /^Add/ }).click()
  await page.getByRole('link', { name: /View cart, 2 items/ }).click()

  const totalText = await page
    .locator('aside[aria-labelledby="cart-summary-heading"] p.font-display')
    .textContent()

  await page.goto('/checkout')
  await page.locator('#fullName').fill('TEST ORDER')
  await page.locator('#phone').fill('03000000001')
  await page.locator('#building').fill('Al Ghaffar Mall')
  await page.locator('#floor').fill('3rd Floor')
  await page.locator('#officeOrShop').fill('Office 302')

  await page.getByRole('button', { name: /Place order/ }).click()

  try {
    await expect(page).toHaveURL(/\/order-confirmation\/CO-/, { timeout: 60_000 })
  } catch (error) {
    const alertText = await page
      .getByRole('alert')
      .first()
      .textContent()
      .catch(() => null)
    throw new Error(
      `The order was not placed (still on ${new URL(page.url()).pathname}). ` +
        `The page reported: ${alertText?.trim() ?? 'no error message'}`,
    )
  }

  const orderNumber = new URL(page.url()).pathname.split('/').pop() ?? ''
  expect(orderNumber).toMatch(/^CO-\d{6}-[A-Z0-9]{4}$/)

  // Confirmation page content.
  await expect(page.locator('body')).toContainText('Order received')
  await expect(page.locator('body')).toContainText(orderNumber)
  await expect(page.locator('body')).toContainText('Cash on delivery')

  writeState({ orderNumber, total: Number((totalText ?? '').replace(/[^\d]/g, '')) })

  // Diagnostic: is the guest session actually persisted in this browser?
  const afterOrderBrowsers = await page.evaluate(async () =>
    ((await indexedDB.databases?.()) ?? []).map((entry) => entry.name),
  )
  const afterOrderKeys = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.toLowerCase().includes('firebase')),
  )
  console.log('[e2e] IDB after order:', JSON.stringify(afterOrderBrowsers))
  console.log('[e2e] localStorage firebase keys after order:', JSON.stringify(afterOrderKeys))

  // Tracking on the same browser.
  await page.goto('/track')
  await page.waitForTimeout(3000)
  const afterReloadBrowsers = await page.evaluate(async () =>
    ((await indexedDB.databases?.()) ?? []).map((entry) => entry.name),
  )
  console.log('[e2e] IDB after reload:', JSON.stringify(afterReloadBrowsers))
  await page.locator('#orderNumber').fill(orderNumber)
  await page.getByRole('button', { name: 'Track order' }).click()

  await expect(page.locator('body')).toContainText(orderNumber)
  await expect(page.locator('body')).toContainText('Order received')
  await expect(page.locator('body')).not.toContainText('Order not found on this device')
})

test('customer: register, sign out, sign in and see the order in My Orders', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-pixel-5', mobileOnly)
  test.setTimeout(180_000)

  const { orderNumber } = readState()
  expect(orderNumber, 'the guest order number should have been saved').toBeTruthy()

  const credentials = newCredentials()
  writeState(credentials)

  await page.goto('/register')
  // No wait here on purpose: register() awaits auth.authStateReady(), so the
  // restored guest session is linked even when the form is submitted at once.
  await page.locator('#name').fill('TEST ORDER')
  await page.locator('#email').fill(credentials.email)
  await page.locator('#password').fill(credentials.password)
  await page.locator('#confirmPassword').fill(credentials.password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/account$/, { timeout: 60_000 })
  await expect(page.locator('body')).toContainText('Your orders')
  await expect(page.locator('body')).toContainText(orderNumber as string)

  // Sign out, then back in.
  await page.getByRole('button', { name: 'Sign out' }).click()
  // The account page sends you home, while RequireAuth notices the empty
  // session first and lands you on /login — either is a signed-out landing.
  await expect(page).toHaveURL(/\/(login)?$/, { timeout: 30_000 })
  await expect(page.locator('body')).not.toContainText('Your orders')

  await page.goto('/login')
  await page.locator('#email').fill(credentials.email)
  await page.locator('#password').fill(credentials.password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/account$/, { timeout: 60_000 })
  await expect(page.locator('body')).toContainText('Your orders')
  await expect(page.locator('body')).toContainText(orderNumber as string)
})

for (const path of ['/admin', '/admin/orders']) {
  test(`customer: ${path} shows the staff-only card, never admin data`, async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-pixel-5', mobileOnly)
    test.setTimeout(120_000)

    const { email, password } = readState()
    expect(email, 'the registered account should have been saved').toBeTruthy()

    await page.goto('/login')
    await page.locator('#email').fill(email as string)
    await page.locator('#password').fill(password as string)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/account$/, { timeout: 60_000 })

    await page.goto(path)

    // A customer session gets the deliberate "Staff access only" card: the
    // claim-based guard blocks the panel without a redirect, so the URL stays.
    await expect(page.getByRole('heading', { name: 'Staff access only' })).toBeVisible({
      timeout: 20_000,
    })
    expect(new URL(page.url()).pathname).toBe(path)
    await expect(page.getByRole('navigation', { name: 'Admin sections' })).toHaveCount(0)
  })
}
