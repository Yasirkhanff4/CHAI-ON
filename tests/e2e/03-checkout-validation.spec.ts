import { expect, test } from '@playwright/test'

async function seedCart(page: import('@playwright/test').Page) {
  await page.goto('/menu')
  await page
    .getByRole('article')
    .first()
    .getByRole('button', { name: /^Add/ })
    .click()
  await page.goto('/checkout')
}

const placeOrder = 'button:has-text("Place order")'

test('checkout: empty name/phone/building/floor/office are all rejected', async ({ page }) => {
  await seedCart(page)

  const submit = page.locator(placeOrder)
  await expect(submit).toBeEnabled()
  await submit.click()

  await expect(page.locator('body')).toContainText('Enter the name we should ask for on delivery.')
  await expect(page.locator('body')).toContainText('Enter your mobile number so we can call about your order.')
  await expect(page.locator('body')).toContainText('Enter the building or plaza name.')
  await expect(page.locator('body')).toContainText('Enter your floor, e.g. 3rd Floor.')
  await expect(page.locator('body')).toContainText('Enter your office or shop number.')

  // Still on checkout: nothing was submitted.
  await expect(page).toHaveURL(/\/checkout$/)
})

test('checkout: an invalid phone number is rejected', async ({ page }) => {
  await seedCart(page)

  await page.locator('#fullName').fill('TEST ORDER')
  await page.locator('#phone').fill('12345')
  await page.locator('#building').fill('Al Ghaffar Mall')
  await page.locator('#floor').fill('3rd Floor')
  await page.locator('#officeOrShop').fill('Office 302')

  await page.locator(placeOrder).click()

  await expect(page.locator('body')).toContainText(
    'Enter a valid Pakistani mobile number, for example 0300 1234567.',
  )
  await expect(page).toHaveURL(/\/checkout$/)
})
