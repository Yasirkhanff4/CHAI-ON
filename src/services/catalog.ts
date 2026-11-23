import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import { getDb, isFirebaseConfigured } from '@/lib/firebase/config'
import { featuredProducts } from '@/data/menu'
import { safeImageSrc } from '@/lib/productImage'
import type { Product } from '@/types'

export const PRODUCT_FIELDS = [
  'name',
  'description',
  'price',
  'imageUrl',
  'imagePosition',
  'badge',
  'isAvailable',
  'isActive',
  'sortOrder',
] as const

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback
}

export function mapProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: String(data.name ?? 'Tea'),
    description: String(data.description ?? ''),
    price: Math.max(0, toNumber(data.price, 0)),
    // Accepts /images/…, an https url or an uploaded image data url only.
    imageUrl: safeImageSrc(typeof data.imageUrl === 'string' ? data.imageUrl : null),
    imagePosition: typeof data.imagePosition === 'string' ? data.imagePosition : undefined,
    badge: typeof data.badge === 'string' && data.badge ? data.badge : undefined,
    isAvailable: data.isAvailable !== false,
    isActive: data.isActive !== false,
    sortOrder: toNumber(data.sortOrder, 999),
  }
}

function sortProducts(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name),
  )
}

/**
 * Live public catalog. Only products flagged `isActive` may be read by
 * visitors, so the query must carry that filter for Firestore rules.
 */
export function subscribeProducts(
  onProducts: (products: Product[]) => void,
  onError: (error: unknown) => void,
): () => void {
  if (!isFirebaseConfigured) return () => {}

  const publicQuery = query(collection(getDb(), 'products'), where('isActive', '==', true))

  return onSnapshot(
    publicQuery,
    (snapshot) => {
      const products = snapshot.docs.map((entry) =>
        mapProduct(entry.id, entry.data() as Record<string, unknown>),
      )
      onProducts(sortProducts(products))
    },
    (error) => onError(error),
  )
}

/** Admin view: every product, including hidden ones. */
export async function fetchAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(getDb(), 'products'))
  return sortProducts(
    snapshot.docs.map((entry) => mapProduct(entry.id, entry.data() as Record<string, unknown>)),
  )
}

export async function fetchProduct(productId: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(getDb(), 'products', productId))
  if (!snapshot.exists()) return null
  return mapProduct(snapshot.id, snapshot.data() as Record<string, unknown>)
}

export type ProductInput = {
  name: string
  description: string
  price: number
  imageUrl: string
  imagePosition?: string
  badge?: string
  isAvailable: boolean
  isActive: boolean
  sortOrder: number
}

export function slugifyProductId(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40) || `product-${Date.now().toString(36)}`
  )
}

export async function createProduct(input: ProductInput): Promise<string> {
  const baseId = slugifyProductId(input.name)
  const existing = await getDoc(doc(getDb(), 'products', baseId))
  const productId = existing.exists() ? `${baseId}-${Date.now().toString(36)}` : baseId

  await setDoc(doc(getDb(), 'products', productId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return productId
}

/** Seeds the CHAYON menu when the catalog is still empty. */
export async function seedLaunchProducts(): Promise<void> {
  for (const product of featuredProducts) {
    const reference = doc(getDb(), 'products', product.id)
    const snapshot = await getDoc(reference)
    if (snapshot.exists()) continue

    await setDoc(reference, {
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      imagePosition: product.imagePosition ?? '50% 50%',
      badge: product.badge ?? '',
      isAvailable: product.isAvailable,
      isActive: true,
      sortOrder: product.sortOrder ?? 999,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}
