export type SugarLevel = 'none' | 'less' | 'normal' | 'extra'
export type TeaStrength = 'light' | 'normal' | 'strong'

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
}

export interface MenuOption<T extends string> {
  value: T
  label: string
}
