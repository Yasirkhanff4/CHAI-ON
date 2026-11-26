import { categoryForProduct, supportsTeaOptions } from '@/data/menu'
import { business } from '@/data/site'
import { formatPKR } from '@/lib/format'
import type { CartTotals, SugarLevel, TeaStrength } from '@/types'

export type WhatsAppOrderItem = {
  name: string
  quantity: number
  unitPrice: number
  /** Missing or empty when the item has no sugar/strength choice. */
  sugar?: SugarLevel | null
  strength?: TeaStrength | null
  /** Optional per-item instruction from the customer. */
  note?: string | null
}

/** Delivery details typed in the cart dialog. */
export type WhatsAppDeliveryDetails = {
  fullName: string
  building: string
  floor: string
  officeOrShop: string
}

/** Sugar is written as a short phrase, e.g. "Extra sugar". */
const SUGAR_WORDS: Record<SugarLevel, string> = {
  none: 'No sugar',
  less: 'Less sugar',
  normal: 'Normal sugar',
  extra: 'Extra sugar',
}

const STRENGTH_WORDS: Record<TeaStrength, string> = {
  light: 'Light',
  normal: 'Normal',
  strong: 'Strong',
}

function itemLine(item: WhatsAppOrderItem): string {
  const quantity = Math.max(1, Math.trunc(item.quantity) || 1)
  const lineTotal = item.unitPrice * quantity
  const options: string[] = []
  const category = categoryForProduct({ name: item.name })

  // Default choices are left out so the line stays short.
  if (supportsTeaOptions(category)) {
    if (item.sugar && item.sugar !== 'normal') options.push(SUGAR_WORDS[item.sugar])
    if (item.strength && item.strength !== 'normal') {
      options.push(STRENGTH_WORDS[item.strength])
    }
  }

  const choice = options.length > 0 ? ` (${options.join(', ')})` : ''
  const note = item.note?.replace(/\s+/g, ' ').trim()
  const noteText = note ? ` - Note: ${note}` : ''

  return `${quantity} x ${item.name}${choice} - ${formatPKR(lineTotal)}${noteText}`
}

/** "ahmed raza" becomes "Ahmed Raza"; the rest of each word stays as typed. */
function capitalizeWords(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** "3" becomes "Floor 3", while "3rd Floor" is used as typed. */
function withLabel(value: string, label: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^\d+$/.test(trimmed) ? `${label} ${trimmed}` : trimmed
}

/** A WhatsApp chat with an optional pre-filled message. */
export function buildWhatsAppChatUrl(message?: string): string {
  const base = business.whatsappUrl
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** The first cup offer button. The message lives in src/data/site.ts. */
export function buildFirstCupOfferUrl(): string {
  return buildWhatsAppChatUrl(business.firstCupMessage)
}

/**
 * Greeting-only chat used by the floating chip, hero and footer. These buttons
 * never carry cart items or saved delivery details.
 */
export function buildWhatsAppGreetingUrl(): string {
  return buildWhatsAppChatUrl(`Assalam-o-Alaikum ${business.name}!\nMujhe chai order karni hai.`)
}

/**
 * Plain-text order message: one short line per item, options only when they
 * differ from the default, and the delivery charge only when one is charged.
 * The customer confirms the text in WhatsApp before it is sent.
 */
export function buildWhatsAppOrderMessage(
  items: WhatsAppOrderItem[],
  totals: CartTotals,
  details: WhatsAppDeliveryDetails,
): string {
  const order: string[] = items.map(itemLine)

  if (totals.deliveryCharge > 0) {
    order.push(`Delivery: ${formatPKR(totals.deliveryCharge)}`)
  }
  order.push(`Total: ${formatPKR(totals.total)}`)

  const address = [
    capitalizeWords(details.building),
    withLabel(details.floor, 'Floor'),
    withLabel(details.officeOrShop, 'Office'),
  ].filter((part) => part !== '')

  const lines = [`Order from ${business.name}`, '', ...order, '']
  lines.push(`Name: ${capitalizeWords(details.fullName)}`)
  if (address.length > 0) lines.push(`Deliver to: ${address.join(', ')}`)
  lines.push('', 'Thank you!')

  return lines.join('\n')
}

/** WhatsApp order link built from the cart and the details dialog. */
export function buildWhatsAppOrderUrl(
  items: WhatsAppOrderItem[],
  totals: CartTotals,
  details: WhatsAppDeliveryDetails,
): string {
  return buildWhatsAppChatUrl(buildWhatsAppOrderMessage(items, totals, details))
}
