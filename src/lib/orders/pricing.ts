import { featuredProducts } from '@/data/menu'
import { orderSettings } from '@/data/site'
import { OrderError } from '@/lib/orders/errors'
import { STRENGTH_LEVELS, SUGAR_LEVELS } from '@/types'
import type { Product } from '@/types'
import type { OrderLine, OrderSubmissionItem } from '@/types/order'

/** UI cap for one product/customization line. */
export const MAX_QUANTITY_PER_LINE = orderSettings.maxQuantityPerLine

export type PricingSettings = {
  deliveryCharge: number
  minimumOrder: number
}

export type OrderPricing = {
  items: OrderLine[]
  itemCount: number
  subtotal: number
  deliveryCharge: number
  total: number
}

/**
 * Rebuilds every cart line from the trusted product catalog.
 *
 * The client sends only product id, quantity, sugar and strength. Names and
 * prices always come from the catalog (Firestore when configured), so a
 * tampered cart cannot change what the customer is charged. The authoritative
 * version of this logic runs inside the createOrder Cloud Function.
 */
export function priceOrder(
  items: OrderSubmissionItem[],
  products: Product[] = featuredProducts,
  settings: PricingSettings = orderSettings,
): OrderPricing {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError('VALIDATION', 'Your cart is empty. Add something from the menu before checking out.')
  }

  if (items.length > 20) {
    throw new OrderError('VALIDATION', 'Your cart has too many different items for one order.')
  }

  const catalog = new Map(products.map((product) => [product.id, product]))
  const unavailable: string[] = []
  const lines: OrderLine[] = []
  const mergedLines = new Map<string, OrderLine>()

  for (const item of items) {
    const product = catalog.get(item.productId)

    if (!product || !product.isAvailable || product.isActive === false) {
      unavailable.push(product?.name ?? 'An item in your cart')
      continue
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new OrderError('VALIDATION', `Choose a quantity of at least 1 for ${product.name}.`)
    }

    if (item.quantity > MAX_QUANTITY_PER_LINE) {
      throw new OrderError(
        'VALIDATION',
        `We can make up to ${MAX_QUANTITY_PER_LINE} of ${product.name} per order.`,
      )
    }

    if (!(SUGAR_LEVELS as readonly string[]).includes(item.sugar)) {
      throw new OrderError('VALIDATION', `Choose a valid sugar level for ${product.name}.`)
    }

    if (!(STRENGTH_LEVELS as readonly string[]).includes(item.strength)) {
      throw new OrderError('VALIDATION', `Choose a valid strength for ${product.name}.`)
    }

    const lineId = `${product.id}::${item.sugar}::${item.strength}`
    const existing = mergedLines.get(lineId)

    if (existing) {
      existing.quantity += item.quantity
      if (existing.quantity > MAX_QUANTITY_PER_LINE) {
        throw new OrderError(
          'VALIDATION',
          `We can make up to ${MAX_QUANTITY_PER_LINE} of ${product.name} per order.`,
        )
      }
      existing.lineTotal = existing.unitPrice * existing.quantity
      continue
    }

    const line: OrderLine = {
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      sugar: item.sugar,
      strength: item.strength,
      unitPrice: product.price,
      lineTotal: product.price * item.quantity,
    }

    mergedLines.set(lineId, line)
    lines.push(line)
  }

  if (unavailable.length > 0) {
    throw new OrderError(
      'PRODUCT_UNAVAILABLE',
      `${unavailable.join(' and ')} ${unavailable.length === 1 ? 'is' : 'are'} no longer available. Remove ${unavailable.length === 1 ? 'it' : 'them'} from your cart to continue.`,
      { unavailableProducts: unavailable },
    )
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
  const deliveryCharge =
    subtotal > 0 ? Math.max(0, Math.trunc(settings.deliveryCharge)) : 0

  if (subtotal < settings.minimumOrder) {
    throw new OrderError(
      'MINIMUM_NOT_MET',
      `The minimum order is Rs ${settings.minimumOrder}. Add a little more tea to continue.`,
    )
  }

  return {
    items: lines,
    itemCount,
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
  }
}
