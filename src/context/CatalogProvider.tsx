import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CatalogContext } from '@/context/catalogContext'
import { featuredProducts } from '@/data/menu'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { subscribeProducts } from '@/services/catalog'
import type { Product } from '@/types'

type CatalogProviderProps = {
  children: ReactNode
}

/**
 * Supplies the product catalog from Firestore when it is configured.
 * Until products exist in Firestore the launch catalog keeps the storefront
 * usable, and if the read fails the site still renders rather than going blank.
 */
export function CatalogProvider({ children }: CatalogProviderProps) {
  const [products, setProducts] = useState<Product[]>(featuredProducts)
  const [usingLaunchCatalog, setUsingLaunchCatalog] = useState(true)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!isFirebaseConfigured) return

    const unsubscribe = subscribeProducts(
      (nextProducts) => {
        setLoading(false)
        setError(null)
        if (nextProducts.length === 0) {
          setProducts(featuredProducts)
          setUsingLaunchCatalog(true)
          return
        }
        setProducts(nextProducts)
        setUsingLaunchCatalog(false)
      },
      (snapshotError) => {
        setLoading(false)
        setError(describeFirebaseError(snapshotError, 'The menu could not be loaded.'))
      },
    )

    return unsubscribe
  }, [reloadToken])

  const refresh = useCallback(() => {
    setLoading(isFirebaseConfigured)
    setReloadToken((token) => token + 1)
  }, [])

  const getProduct = useCallback(
    (productId: string) => products.find((product) => product.id === productId),
    [products],
  )

  const value = useMemo(
    () => ({ products, loading, error, usingLaunchCatalog, refresh, getProduct }),
    [products, loading, error, usingLaunchCatalog, refresh, getProduct],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
