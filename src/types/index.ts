export const SUGAR_LEVELS = ['none', 'less', 'normal', 'extra'] as const
export type SugarLevel = (typeof SUGAR_LEVELS)[number]

export const STRENGTH_LEVELS = ['light', 'normal', 'strong'] as const
export type TeaStrength = (typeof STRENGTH_LEVELS)[number]

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'DELIVERY_FAILED'

export interface Product {
  id: string
  name: string
  description: string
  /** Price in PKR */
  price: number
  imageUrl: string
  /** CSS object-position used to frame the product photo */
  imagePosition?: string
  badge?: string
  isAvailable: boolean
  /** Hidden from the public storefront when false. */
  isActive?: boolean
  /** Ordering weight in the menu; lower comes first. */
  sortOrder?: number
}

export interface MenuOption<T extends string> {
  value: T
  label: string
}

export interface CartItem {
  /** Stable cart line id derived from product + customization */
  id: string
  productId: string
  name: string
  imageUrl: string
  /** Verified unit price in PKR for this line */
  unitPrice: number
  quantity: number
  sugar: SugarLevel
  strength: TeaStrength
}

export interface CartTotals {
  subtotal: number
  deliveryCharge: number
  total: number
  itemCount: number
}
