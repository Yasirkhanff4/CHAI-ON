import { createContext, useContext } from 'react'
import type { CartItem, CartTotals, Product, SugarLevel, TeaStrength } from '@/types'

export type CartNotice = {
  id: number
  message: string
}

export type CartContextValue = {
  items: CartItem[]
  totals: CartTotals
  notice: CartNotice | null
  addItem: (
    product: Product,
    sugar: SugarLevel,
    strength: TeaStrength,
    quantity: number,
  ) => void
  updateQuantity: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
  clearCart: () => void
  dismissNotice: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider')
  }
  return context
}
