import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CartContext } from '@/context/cartContext'
import type { CartNotice } from '@/context/cartContext'
import { useCatalog } from '@/context/catalogContext'
import { useStoreSettings } from '@/context/settingsContext'
import { featuredProducts } from '@/data/menu'
import { orderSettings } from '@/data/site'
import {
  calculateCartTotals,
  clampQuantity,
  createCartLine,
  readStoredCart,
  writeStoredCart,
} from '@/lib/cart'
import type { CartItem, Product, SugarLevel, TeaStrength } from '@/types'

type CartProviderProps = {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const { products } = useCatalog()
  const { settings } = useStoreSettings()
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart(featuredProducts))
  const [notice, setNotice] = useState<CartNotice | null>(null)
  const noticeCounter = useRef(0)
  const noticeTimer = useRef<number | null>(null)
  /**
   * Mirrors `items` so handlers can read the latest cart synchronously, even
   * when several changes happen before React re-renders.
   */
  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
    writeStoredCart(items)
  }, [items])

  // Keep a saved cart in step with admin-managed products and prices.
  useEffect(() => {
    setItems((current) => {
      let changed = false

      const next = current.flatMap((item) => {
        const product = products.find((entry) => entry.id === item.productId)

        if (!product || !product.isAvailable || product.isActive === false) {
          changed = true
          return []
        }

        if (
          product.price !== item.unitPrice ||
          product.name !== item.name ||
          product.imageUrl !== item.imageUrl
        ) {
          changed = true
          return [
            {
              ...item,
              unitPrice: product.price,
              name: product.name,
              imageUrl: product.imageUrl,
            },
          ]
        }

        return [item]
      })

      return changed ? next : current
    })
  }, [products])

  useEffect(() => {
    return () => {
      if (noticeTimer.current !== null) {
        window.clearTimeout(noticeTimer.current)
      }
    }
  }, [])

  const dismissNotice = useCallback(() => {
    if (noticeTimer.current !== null) {
      window.clearTimeout(noticeTimer.current)
      noticeTimer.current = null
    }
    setNotice(null)
  }, [])

  const showNotice = useCallback((message: string) => {
    noticeCounter.current += 1
    setNotice({ id: noticeCounter.current, message })

    if (noticeTimer.current !== null) {
      window.clearTimeout(noticeTimer.current)
    }
    noticeTimer.current = window.setTimeout(() => {
      noticeTimer.current = null
      setNotice(null)
    }, 3500)
  }, [])

  const commitItems = useCallback((next: CartItem[]) => {
    itemsRef.current = next
    setItems(next)
  }, [])

  const addItem = useCallback(
    (product: Product, sugar: SugarLevel, strength: TeaStrength, quantity: number) => {
      const line = createCartLine(product, sugar, strength, quantity)
      const current = itemsRef.current
      const existing = current.find((item) => item.id === line.id)
      const requested = (existing?.quantity ?? 0) + line.quantity
      const capped = requested > orderSettings.maxQuantityPerLine
      const finalQuantity = clampQuantity(requested)

      if (existing) {
        commitItems(
          current.map((item) =>
            item.id === line.id
              ? { ...item, quantity: finalQuantity, unitPrice: line.unitPrice }
              : item,
          ),
        )
      } else {
        commitItems([...current, { ...line, quantity: finalQuantity }])
      }

      showNotice(
        capped
          ? `Maximum ${orderSettings.maxQuantityPerLine} cups per tea in one order.`
          : `${line.quantity} × ${product.name} added to your cart.`,
      )
    },
    [commitItems, showNotice],
  )

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      const current = itemsRef.current
      const next = clampQuantity(quantity)

      if (next < 1) {
        commitItems(current.filter((item) => item.id !== lineId))
        return
      }

      commitItems(
        current.map((item) => (item.id === lineId ? { ...item, quantity: next } : item)),
      )
    },
    [commitItems],
  )

  const removeItem = useCallback(
    (lineId: string) => {
      const current = itemsRef.current
      const removed = current.find((item) => item.id === lineId)
      commitItems(current.filter((item) => item.id !== lineId))
      showNotice(removed ? `${removed.name} removed from your cart.` : 'Item removed.')
    },
    [commitItems, showNotice],
  )

  const clearCart = useCallback(
    (options?: { silent?: boolean }) => {
      if (itemsRef.current.length === 0) return
      commitItems([])
      if (!options?.silent) showNotice('Cart cleared.')
    },
    [commitItems, showNotice],
  )

  const totals = useMemo(
    () => calculateCartTotals(items, settings.deliveryCharge),
    [items, settings.deliveryCharge],
  )

  const value = useMemo(
    () => ({
      items,
      totals,
      notice,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      dismissNotice,
    }),
    [items, totals, notice, addItem, updateQuantity, removeItem, clearCart, dismissNotice],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
