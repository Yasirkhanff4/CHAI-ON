import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { parsePKR } from './helpers'

function summary(page: Page): Locator {
  return page.locator('aside[aria-labelledby="cart-summary-heading"]')
}

function cartLines(page: Page): Locator {
  return page.locator('section[aria-label="Cart contents"] ul > li')
}

/** Unit price and quantity straight from each cart row. */
async function lineAmounts(page: Page): Promise<number[]> {
  const lines = cartLines(page)
  const count = await lines.count()
  const amounts: number[] = []

  for (let index = 0; index < count; index += 1) {
    const line = lines.nth(index)
    const each = parsePKR(await line.locator('p', { hasText: 'each' }).first().textContent())
    const quantityText = await line
      .locator('[role="group"] span[aria-live="polite"]')
      .first()
      .textContent()
    const quantity = Number((quantityText ?? '').trim())
    expect(quantity, `quantity on cart line ${index + 1}`).toBeGreaterThan(0)
    amounts.push(each * quantity)
  }

  return amounts
}

async function total(page: Page): Promise<number> {
  // Structure-based so class names can change without breaking the check: the
  // amount is the sibling of the "Total" label inside the summary.
  return parsePKR(
    await summary(page)
      .locator('p:text-is("Total")')
      .locator('xpath=following-sibling::p[1]')
      .textContent(),
  )
}

test('cart: add two teas, change quantity and sugar, remove one, totals add up', async ({
  page,
}) => {
  await page.goto('/menu')

  const cards = page.getByRole('article')
  await expect(cards.first()).toBeVisible()

  const first = cards.first()
  const firstName = (await first.locator('h2').textContent())?.trim() ?? ''

  // Line 1: default sugar/strength, one cup.
  await first.getByRole('button', { name: /^Add/ }).click()
  await expect(page.getByRole('link', { name: /View cart, 1 item/ })).toBeVisible()

  // Line 2: no sugar, two cups.
  const second = cards.nth(1)
  const secondName = (await second.locator('h2').textContent())?.trim() ?? ''
  await second.locator('label').filter({ hasText: 'No' }).first().click()
  await second.getByRole('button', { name: `Increase ${secondName} quantity` }).click()
  await second.getByRole('button', { name: /^Add/ }).click()

  await page.getByRole('link', { name: /View cart, 3 items/ }).click()
  await expect(page).toHaveURL(/\/cart$/)

  // Two lines, three cups, sugar choice kept.
  await expect(cartLines(page)).toHaveCount(2)
  await expect(page.locator('body')).toContainText(/2 items/)
  await expect(summary(page)).toContainText(/\(3 items\)/)
  await expect(page.locator('body')).toContainText('No Sugar · Normal')

  const before = await lineAmounts(page)
  expect(before).toHaveLength(2)
  expect(await total(page)).toBe(before.reduce((sum, value) => sum + value, 0))

  // Quantity +1 on the first line.
  await page.getByRole('button', { name: `Increase ${firstName} quantity` }).click()
  await expect(summary(page)).toContainText(/\(4 items\)/)

  const after = await lineAmounts(page)
  expect(after[0]).toBeGreaterThan(before[0])
  expect(await total(page)).toBe(after.reduce((sum, value) => sum + value, 0))

  // Remove the second line.
  await page.getByRole('button', { name: 'Remove' }).last().click()
  await expect(cartLines(page)).toHaveCount(1)
  await expect(page.locator('body')).toContainText(/1 item/)
  await expect(summary(page)).toContainText(/\(2 items\)/)

  const remaining = await lineAmounts(page)
  expect(remaining).toHaveLength(1)
  expect(await total(page)).toBe(remaining[0])
})

test('cart: "Order on WhatsApp" opens wa.me with the items and total', async ({ page }) => {
  await page.goto('/menu')
  const card = page.getByRole('article').first()
  await card.getByRole('button', { name: /^Add/ }).click()
  await page.getByRole('link', { name: /View cart/ }).click()

  const cartTotal = await total(page)
  const button = summary(page).getByRole('link', { name: /Order on WhatsApp/i })
  await expect(button).toBeVisible()

  const href = await button.getAttribute('href')
  expect(href, 'WhatsApp link is missing').toBeTruthy()

  const url = new URL(href as string)
  expect(url.origin + url.pathname).toBe('https://wa.me/923091104343')

  const text = url.searchParams.get('text') ?? ''
  expect(text).toContain('Assalam-o-Alaikum CHAYON!')
  expect(text).toContain('Mujhe ye order karna hai:')
  expect(text).toContain('• 1 x ')
  expect(text).toContain('Sugar:')
  expect(text).toContain('Strength:')
  expect(text).toContain('Subtotal: Rs')
  expect(text).toContain(`Total: Rs ${new Intl.NumberFormat('en-PK').format(cartTotal)}`)
  expect(text).toContain('Building / Plaza:')

  // Newlines must survive as %0A in the wa.me link.
  expect(href).toContain('%0A')
})

test('cart: WhatsApp message prefills saved checkout details', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'chai-on:customer-details:v1',
      JSON.stringify({
        fullName: 'Ahmed Raza',
        building: 'Al Ghaffar Mall',
        floor: '3rd Floor',
        officeOrShop: 'Office 302',
      }),
    )
  })

  await page.goto('/menu')
  const card = page.getByRole('article').first()
  await card.getByRole('button', { name: /^Add/ }).click()
  await page.getByRole('link', { name: /View cart/ }).click()

  const href = await summary(page)
    .getByRole('link', { name: /Order on WhatsApp/i })
    .getAttribute('href')
  const text = new URL(href as string).searchParams.get('text') ?? ''

  expect(text).toContain('Naam: Ahmed Raza')
  expect(text).toContain('Building / Plaza: Al Ghaffar Mall')
  expect(text).toContain('Floor: 3rd Floor')
  expect(text).toContain('Office / Shop: Office 302')
})
