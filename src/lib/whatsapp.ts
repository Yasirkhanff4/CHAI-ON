import { strengthLabel, sugarLabel } from '@/data/menu'
import { business } from '@/data/site'
import { readSavedCustomerDetails } from '@/lib/customerDetails'
import { formatPKR } from '@/lib/format'
import type { CartTotals, SugarLevel, TeaStrength } from '@/types'

export type WhatsAppOrderItem = {
  name: string
  quantity: number
  unitPrice: number
  /** Missing or empty when the tea has no sugar/strength choice. */
  sugar?: SugarLevel | null
  strength?: TeaStrength | null
  /** Optional per-item instruction from the customer. */
  note?: string | null
}

function itemBlock(item: WhatsAppOrderItem): string {
  const quantity = Math.max(1, Math.trunc(item.quantity) || 1)
  const lineTotal = item.unitPrice * quantity
  const details: string[] = []

  if (item.sugar) details.push(`Sugar: ${sugarLabel(item.sugar)}`)
  if (item.strength) details.push(`Strength: ${strengthLabel(item.strength)}`)
  details.push(formatPKR(lineTotal))

  const lines = [`• ${quantity} x ${item.name}`, `  ${details.join(' | ')}`]

  const note = item.note?.replace(/\s+/g, ' ').trim()
  if (note) lines.push(`  Note: ${note}`)

  return lines.join('\n')
}

function detailLine(label: string, value?: string): string {
  const clean = value?.trim()
  return clean ? `${label} ${clean}` : label
}

/**
 * WhatsApp order link. The cart is written into the message so the shop sees
 * exactly what the customer chose before replying; nothing is submitted
 * anywhere until the customer presses send in WhatsApp.
 */
export function buildWhatsAppOrderUrl(
  items: WhatsAppOrderItem[],
  totals: CartTotals,
): string {
  const base = business.whatsappUrl

  if (items.length === 0) {
    const greeting = 'Assalam-o-Alaikum CHAI ON!\nMujhe chai order karni hai.'
    return `${base}?text=${encodeURIComponent(greeting)}`
  }

  const saved = readSavedCustomerDetails()

  const lines = [
    'Assalam-o-Alaikum CHAI ON!',
    'Mujhe ye order karna hai:',
    '',
    ...items.map(itemBlock),
    '',
    `Subtotal: ${formatPKR(totals.subtotal)}`,
    totals.deliveryCharge > 0
      ? `Delivery: ${formatPKR(totals.deliveryCharge)}`
      : 'Delivery: Free',
    `Total: ${formatPKR(totals.total)}`,
    '',
    detailLine('Naam:', saved?.fullName),
    detailLine('Building / Plaza:', saved?.building),
    detailLine('Floor:', saved?.floor),
    detailLine('Office / Shop:', saved?.officeOrShop),
  ]

  return `${base}?text=${encodeURIComponent(lines.join('\n'))}`
}
