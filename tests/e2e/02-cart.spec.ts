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

/** One tea in the cart, then the cart page. Stubs window.open to record links. */
async function seedCart(page: Page) {
  await page.addInitScript(() => {
    const state = window as unknown as { __whatsappLinks: string[] }
    state.__whatsappLinks = []
    window.open = ((url?: string | URL) => {
      state.__whatsappLinks.push(String(url))
      return null
    }) as unknown as typeof window.open
  })

  await page.goto('/menu')
  await page
    .getByRole('article')
    .first()
    .getByRole('button', { name: /^Add/ })
    .click()
  await page.getByRole('link', { name: /View cart/ }).click()
  await expect(page).toHaveURL(/\/cart$/)
}

async function whatsappLinks(page: Page): Promise<string[]> {
  return page.evaluate(
    () => (window as unknown as { __whatsappLinks?: string[] }).__whatsappLinks ?? [],
  )
}

async function openDeliveryDialog(page: Page): Promise<Locator> {
  await summary(page).getByRole('button', { name: /Order on WhatsApp/i }).click()
  const dialog = page.getByRole('dialog', { name: 'Delivery details' })
  await expect(dialog).toBeVisible()
  return dialog
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

test('cart: WhatsApp asks for delivery details before opening a plain text order', async ({
  page,
}) => {
  await seedCart(page)
  const cartTotal = await total(page)

  const trigger = summary(page).getByRole('button', { name: /Order on WhatsApp/i })
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
  await trigger.click()

  const dialog = await openDeliveryDialog(page)
  await expect(page).toHaveURL(/\/cart$/)
  expect(await whatsappLinks(page), 'the cart button must not open WhatsApp on its own').toEqual(
    [],
  )

  // Empty fields, all required.
  for (const id of ['#wa-order-name', '#wa-order-building', '#wa-order-floor', '#wa-order-office']) {
    await expect(page.locator(id)).toHaveValue('')
  }

  await dialog.getByRole('button', { name: 'Send on WhatsApp' }).click()
  await expect(dialog).toContainText('Enter your name.')
  await expect(dialog).toContainText('Enter the building or plaza name.')
  await expect(dialog).toContainText('Enter your floor')
  await expect(dialog).toContainText('Enter your office or shop number.')
  expect(await whatsappLinks(page), 'nothing may open while fields are empty').toEqual([])

  await page.locator('#wa-order-name').fill('ahmed raza')
  await page.locator('#wa-order-building').fill('al ghaffar mall')
  await page.locator('#wa-order-floor').fill('3')
  await page.locator('#wa-order-office').fill('302')
  await dialog.getByRole('button', { name: 'Send on WhatsApp' }).click()
  await expect(dialog).toBeHidden()

  const links = await whatsappLinks(page)
  expect(links).toHaveLength(1)

  const url = new URL(links[0])
  expect(url.origin + url.pathname).toBe('https://wa.me/923091104343')
  const text = url.searchParams.get('text') ?? ''
  const lines = text.split('\n')

  expect(lines[0]).toBe('Order from CHAYON')
  expect(lines[1]).toBe('')

  // A tea on the default sugar and strength carries no options bracket.
  expect(lines[2]).toMatch(/^1 x .+ - Rs [\d,]+$/)
  expect(lines[2]).not.toContain('(')

  expect(text).not.toContain('Subtotal')
  expect(text).not.toContain('•')
  expect(text).not.toContain('—')
  expect(text).not.toContain('Delivery: Free')
  expect(text).not.toContain('Delivery:')

  expect(lines[3]).toBe(`Total: Rs ${new Intl.NumberFormat('en-PK').format(cartTotal)}`)

  // Details are cleaned up: name and building title-cased, bare numbers labelled.
  expect(lines.slice(-5)).toEqual([
    '',
    'Name: Ahmed Raza',
    'Deliver to: Al Ghaffar Mall, Floor 3, Office 302',
    '',
    'Thank you!',
  ])

  // Details are saved for next time.
  const saved = await page.evaluate(() =>
    window.localStorage.getItem('chai-on:customer-details:v1'),
  )
  expect(saved).toContain('ahmed raza')

  // Newlines must survive as %0A in the wa.me link.
  expect(links[0]).toContain('%0A')
})

test('cart: delivery details prefill saved values and Clear empties them', async ({ page }) => {
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
  await page
    .getByRole('article')
    .first()
    .getByRole('button', { name: /^Add/ })
    .click()
  await page.getByRole('link', { name: /View cart/ }).click()

  const dialog = await openDeliveryDialog(page)
  await expect(page.locator('#wa-order-name')).toHaveValue('Ahmed Raza')
  await expect(page.locator('#wa-order-building')).toHaveValue('Al Ghaffar Mall')
  await expect(page.locator('#wa-order-floor')).toHaveValue('3rd Floor')
  await expect(page.locator('#wa-order-office')).toHaveValue('Office 302')

  await dialog.getByRole('button', { name: 'Clear' }).click()
  for (const id of ['#wa-order-name', '#wa-order-building', '#wa-order-floor', '#wa-order-office']) {
    await expect(page.locator(id)).toHaveValue('')
  }
})
