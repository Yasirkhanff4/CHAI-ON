import { expect, test } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'
import { devices } from '@playwright/test'
import { writeState } from './helpers'

/**
 * The guest journey. It places exactly ONE live order, so it runs on the mobile
 * project only; the desktop project still covers the pages, cart, checkout
 * validation and the guest staff-guard redirect.
 *
 * There are no customer accounts. The anonymous Firebase session created at
 * guest checkout owns the order, which is what makes tracking work on the
 * device that placed it.
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
  await expect(page).toHaveURL(/\/cart$/)

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

  writeState({ orderNumber })

  // The guest session must survive a reload for tracking to work.
  const afterOrderKeys = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.toLowerCase().includes('firebase')),
  )
  console.log('[e2e] localStorage firebase keys after order:', JSON.stringify(afterOrderKeys))

  // Tracking on the same browser.
  await page.goto('/track')
  await page.waitForTimeout(3000)
  await page.locator('#orderNumber').fill(orderNumber)
  await page.getByRole('button', { name: 'Track order' }).click()

  await expect(page.locator('body')).toContainText(orderNumber)
  await expect(page.locator('body')).toContainText('Order received')
  await expect(page.locator('body')).not.toContainText('Order not found on this device')
})
