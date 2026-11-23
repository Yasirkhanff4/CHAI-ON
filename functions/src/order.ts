import { randomBytes, createHash } from 'node:crypto'
import { Timestamp } from 'firebase-admin/firestore'

/** Shared, server-side order rules. Nothing here trusts the browser. */
export const MAX_QUANTITY_PER_LINE = 20
export const MAX_LINES = 20

export const SUGAR_LEVELS = ['none', 'less', 'normal', 'extra'] as const
export const STRENGTH_LEVELS = ['light', 'normal', 'strong'] as const

export type SugarLevel = (typeof SUGAR_LEVELS)[number]
export type TeaStrength = (typeof STRENGTH_LEVELS)[number]

export type StoreSettings = {
  businessName: string
  contactPhone: string
  deliveryCharge: number
  minimumOrder: number
  openingTime: string
  closingTime: string
  isOrderingOpen: boolean
}

export const DEFAULT_SETTINGS: StoreSettings = {
  businessName: 'CHAYON',
  contactPhone: '0309-1104343',
  deliveryCharge: 0,
  minimumOrder: 0,
  openingTime: '09:00',
  closingTime: '23:00',
  isOrderingOpen: true,
}

export type CustomerDetails = {
  fullName: string
  phone: string
  building: string
  floor: string
  officeOrShop: string
  deliveryInstructions: string
}

export type SubmittedItem = {
  productId: string
  quantity: number
  sugar: string
  strength: string
}

export type PricedItem = {
  productId: string
  name: string
  quantity: number
  sugar: SugarLevel
  strength: TeaStrength
  unitPrice: number
  lineTotal: number
}

const PK_MOBILE = /^03\d{9}$/

export function normalizePhone(input: unknown): string {
  let digits = String(input ?? '').replace(/\D/g, '')

  if (digits.startsWith('0092')) digits = digits.slice(4)
  else if (digits.startsWith('92')) digits = digits.slice(2)

  if (digits.length === 10 && digits.startsWith('3')) digits = `0${digits}`

  return digits
}

export function toE164(local: string): string {
  return PK_MOBILE.test(local) ? `+92${local.slice(1)}` : local
}

export function normalizeText(input: unknown): string {
  return String(input ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeDetails(input: unknown): CustomerDetails {
  const raw = (input ?? {}) as Record<string, unknown>
  return {
    fullName: normalizeText(raw.fullName),
    phone: normalizeText(raw.phone),
    building: normalizeText(raw.building),
    floor: normalizeText(raw.floor),
    officeOrShop: normalizeText(raw.officeOrShop),
    deliveryInstructions: normalizeText(raw.deliveryInstructions),
  }
}

export function validateDetails(details: CustomerDetails): Record<string, string> {
  const errors: Record<string, string> = {}
  const phone = normalizePhone(details.phone)

  if (details.fullName.length < 2) errors.fullName = 'Enter your full name.'
  if (details.fullName.length > 60) errors.fullName = 'Keep the name under 60 characters.'
  if (!PK_MOBILE.test(phone)) {
    errors.phone = 'Enter a valid Pakistani mobile number, for example 0300 1234567.'
  }
  if (details.building.length < 2) errors.building = 'Enter the building or plaza name.'
  if (details.building.length > 80) errors.building = 'Keep the building name under 80 characters.'
  if (details.floor.length < 1) errors.floor = 'Enter your floor.'
  if (details.floor.length > 20) errors.floor = 'Keep the floor under 20 characters.'
  if (details.officeOrShop.length < 1) errors.officeOrShop = 'Enter your office or shop number.'
  if (details.officeOrShop.length > 30) {
    errors.officeOrShop = 'Keep the office or shop number under 30 characters.'
  }
  if (details.deliveryInstructions.length > 300) {
    errors.deliveryInstructions = 'Keep instructions under 300 characters.'
  }

  return errors
}

export function normalizeSubmittedItems(input: unknown): SubmittedItem[] {
  if (!Array.isArray(input)) return []

  return input.slice(0, MAX_LINES).map((entry) => {
    const raw = (entry ?? {}) as Record<string, unknown>
    return {
      productId: normalizeText(raw.productId),
      quantity: Number(raw.quantity),
      sugar: String(raw.sugar ?? ''),
      strength: String(raw.strength ?? ''),
    }
  })
}

export type ProductRecord = {
  name?: string
  price?: number
  isAvailable?: boolean
  isActive?: boolean
}

/** Rebuilds every line from trusted product documents. */
export function priceItems(
  items: SubmittedItem[],
  products: Map<string, ProductRecord>,
): { lines: PricedItem[]; subtotal: number; itemCount: number; unavailable: string[] } {
  const merged = new Map<string, PricedItem>()
  const unavailable: string[] = []

  for (const item of items) {
    const product = products.get(item.productId)

    if (!product || product.isAvailable === false || product.isActive === false) {
      unavailable.push(product?.name ?? 'An item in your cart')
      continue
    }

    const price = Number(product.price)
    if (!Number.isFinite(price) || price < 0) {
      unavailable.push(product.name ?? 'An item in your cart')
      continue
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_QUANTITY_PER_LINE
    ) {
      throw new Error(
        `Quantity for ${product.name ?? 'a product'} must be a whole number between 1 and ${MAX_QUANTITY_PER_LINE}.`,
      )
    }

    if (!(SUGAR_LEVELS as readonly string[]).includes(item.sugar)) {
      throw new Error(`Invalid sugar option for ${product.name ?? 'a product'}.`)
    }
    if (!(STRENGTH_LEVELS as readonly string[]).includes(item.strength)) {
      throw new Error(`Invalid strength option for ${product.name ?? 'a product'}.`)
    }

    const lineId = `${item.productId}::${item.sugar}::${item.strength}`
    const existing = merged.get(lineId)

    if (existing) {
      existing.quantity += item.quantity
      if (existing.quantity > MAX_QUANTITY_PER_LINE) {
        throw new Error(`Maximum ${MAX_QUANTITY_PER_LINE} cups per tea in one order.`)
      }
      existing.lineTotal = existing.unitPrice * existing.quantity
      continue
    }

    merged.set(lineId, {
      productId: item.productId,
      name: product.name ?? item.productId,
      quantity: item.quantity,
      sugar: item.sugar as SugarLevel,
      strength: item.strength as TeaStrength,
      unitPrice: price,
      lineTotal: price * item.quantity,
    })
  }

  const lines = Array.from(merged.values())
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)

  return { lines, subtotal, itemCount, unavailable }
}

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const karachiDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
})

/** CO-YYMMDD-XXXX, read aloud easily over the phone. */
export function generateOrderNumber(now: Date = new Date()): string {
  const parts = karachiDate.formatToParts(now)
  const year = parts.find((part) => part.type === 'year')?.value ?? '00'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'
  const day = parts.find((part) => part.type === 'day')?.value ?? '01'
  const bytes = randomBytes(4)
  let suffix = ''
  for (const byte of bytes) suffix += ALPHABET[byte % ALPHABET.length]
  return `CO-${year}${month}${day}-${suffix}`
}

export function normalizeOrderNumber(input: unknown): string {
  return String(input ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
}

const karachiClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** Minutes since midnight in Pakistan Standard Time. */
export function minutesInKarachi(now: Date = new Date()): number {
  const parts = karachiClock.formatToParts(now)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0')
  return hour * 60 + minute
}

export function parseClock(value: string, fallback: number): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return fallback
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return fallback
  return hours * 60 + minutes
}

export function isOrderingOpen(settings: StoreSettings, now: Date = new Date()): boolean {
  if (settings.isOrderingOpen === false) return false

  const current = minutesInKarachi(now)
  const open = parseClock(settings.openingTime, 9 * 60)
  const close = parseClock(settings.closingTime, 23 * 60)

  if (open === close) return true
  if (open < close) return current >= open && current < close
  // Window crosses midnight, e.g. 18:00 to 02:00.
  return current >= open || current < close
}

export function rateLimitKey(prefix: string, value: string): string {
  return `${prefix}_${createHash('sha256').update(value).digest('hex').slice(0, 32)}`
}

export function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}
