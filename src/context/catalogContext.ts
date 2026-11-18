import { createContext, useContext } from 'react'
import type { Product } from '@/types'

export type CatalogContextValue = {
  products: Product[]
  loading: boolean
  error: string | null
  /** True while the storefront is showing built-in launch data. */
  usingLaunchCatalog: boolean
  refresh: () => void
  getProduct: (productId: string) => Product | undefined
}

export const CatalogContext = createContext<CatalogContextValue | null>(null)

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog must be used inside a CatalogProvider')
  return context
}
