import { featuredProducts } from '@/data/menu'
import { orderSettings } from '@/data/site'
import { STRENGTH_LEVELS, SUGAR_LEVELS } from '@/types'
import type { CartItem, CartTotals, Product, SugarLevel, TeaStrength } from '@/types'

export const CART_STORAGE_KEY = 'chai-on:cart:v1'

/** Stable key so the same tea + customization merges into one cart line. */
export function cartLineId(
  productId: string,
  sugar: SugarLevel,
  strength: TeaStrength,
): string {
  return `${productId}::${sugar}::${strength}`
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1
  const whole = Math.trunc(quantity)
  return Math.min(orderSettings.maxQuantityPerLine, Math.max(1, whole))
}

export function createCartLine(
  product: Product,
  sugar: SugarLevel,
  strength: TeaStrength,
  quantity: number,
): CartItem {
  return {
    id: cartLineId(product.id, sugar, strength),
    productId: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    unitPrice: product.price,
    quantity: clampQuantity(quantity),
    sugar,
    strength,
  }
}

export function calculateCartTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const deliveryCharge = items.length > 0 ? orderSettings.deliveryCharge : 0

  return {
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
    itemCount,
  }
}

/**
 * Reads the cart from localStorage and reconciles it with the current catalog:
 * unknown/unavailable products are dropped and prices are refreshed from the
 * product data so a stale cart can never show an outdated price.
 */
export function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const catalog = new Map(featuredProducts.map((product) => [product.id, product]))
    const merged = new Map<string, CartItem>()

    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue

      const record = entry as Record<string, unknown>
      const productId = typeof record.productId === 'string' ? record.productId : ''
      const product = catalog.get(productId)
      if (!product || !product.isAvailable) continue

      const sugar = record.sugar
      const strength = record.strength
      if (typeof sugar !== 'string' || !(SUGAR_LEVELS as readonly string[]).includes(sugar)) {
        continue
      }
      if (
        typeof strength !== 'string' ||
        !(STRENGTH_LEVELS as readonly string[]).includes(strength)
      ) {
        continue
      }

      const quantity = clampQuantity(
        typeof record.quantity === 'number' ? record.quantity : 1,
      )
      const lineId = cartLineId(
        product.id,
        sugar as SugarLevel,
        strength as TeaStrength,
      )
      const existing = merged.get(lineId)

      if (existing) {
        existing.quantity = clampQuantity(existing.quantity + quantity)
        continue
      }

      merged.set(lineId, {
        id: lineId,
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        unitPrice: product.price,
        quantity,
        sugar: sugar as SugarLevel,
        strength: strength as TeaStrength,
      })
    }

    return Array.from(merged.values())
  } catch {
    return []
  }
}

export function writeStoredCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage can be unavailable (private mode / quota).
    // The cart still works for the current session.
  }
}
