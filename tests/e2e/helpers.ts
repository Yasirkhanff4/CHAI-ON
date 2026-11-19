import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * Console noise that is not an app defect:
 * - React DevTools hint (browser extension / dev build info)
 * - Firebase's WebChannel transport warnings after a socket restart
 */
const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /WebChannelConnection RPC .* transport errored/i,
]

export function watchConsole(page: Page) {
  const errors: string[] = []

  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (IGNORED_CONSOLE.some((pattern) => pattern.test(text))) return
    errors.push(text)
  })

  page.on('pageerror', (error) => {
    errors.push(`Uncaught: ${error.message}`)
  })

  return errors
}

export async function expectNoConsoleErrors(errors: string[], context: string) {
  expect(errors, `console errors while checking ${context}:\n${errors.join('\n')}`).toEqual([])
}

/** Scrolls the page so lazy images load, then reports any that have no pixels. */
export async function expectNoBrokenImages(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 60))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(500)

  const broken = await page.evaluate(() =>
    Array.from(document.images)
      .filter((image) => image.getAttribute('src') && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
  )

  expect(broken, `broken images:\n${broken.join('\n')}`).toEqual([])
}

/** "Rs 1,234" -> 1234 */
export function parsePKR(text: string | null | undefined): number {
  if (!text) throw new Error('Expected an amount such as "Rs 150" but got nothing')
  const digits = text.replace(/[^\d]/g, '')
  if (!digits) throw new Error(`Could not read an amount from "${text}"`)
  return Number(digits)
}

const STATE_PATH = 'test-results/e2e-state.json'

export type RunState = {
  orderNumber?: string
  total?: number
}

export function readState(): RunState {
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8')) as RunState
  } catch {
    return {}
  }
}

export function writeState(patch: RunState) {
  const next = { ...readState(), ...patch }
  mkdirSync(dirname(STATE_PATH), { recursive: true })
  writeFileSync(STATE_PATH, JSON.stringify(next, null, 2))
}
