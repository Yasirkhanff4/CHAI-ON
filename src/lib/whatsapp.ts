import { strengthLabel, sugarLabel } from '@/data/menu'
import { business } from '@/data/site'
import { formatPKR } from '@/lib/format'
import type { CartItem, CartTotals } from '@/types'

/**
 * WhatsApp order link. The cart is written into the message so the shop sees
 * exactly what the customer chose before replying; nothing is submitted
 * anywhere until the customer presses send in WhatsApp.
 */
export function buildWhatsAppOrderUrl(items: CartItem[], totals: CartTotals): string {
  const base = business.whatsappUrl

  if (items.length === 0) {
    const greeting = 'Assalam-o-Alaikum CHAI ON! I would like to order some chai.'
    return `${base}?text=${encodeURIComponent(greeting)}`
  }

  const lines = [
    'Assalam-o-Alaikum CHAI ON! I would like to order:',
    '',
    ...items.map(
      (item) =>
        `• ${item.quantity} × ${item.name} (${sugarLabel(item.sugar)}, ${strengthLabel(item.strength)}) — ${formatPKR(
          item.unitPrice * item.quantity,
        )}`,
    ),
    '',
    `Subtotal: ${formatPKR(totals.subtotal)}`,
    totals.deliveryCharge > 0 ? `Delivery: ${formatPKR(totals.deliveryCharge)}` : 'Delivery: Free',
    `Total: ${formatPKR(totals.total)}`,
    '',
    'My delivery details (building, floor, office):',
  ]

  return `${base}?text=${encodeURIComponent(lines.join('\n'))}`
}
