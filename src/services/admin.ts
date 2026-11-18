import {
  Timestamp,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getDb, getFirebaseStorage } from '@/lib/firebase/config'
import { canTransition } from '@/lib/orderFlow'
import { mapOrder } from '@/lib/orders/mapOrder'
import type { StoreSettings } from '@/data/settings'
import type { OrderStatus } from '@/types'
import type { Order } from '@/types/order'
import { createProduct } from '@/services/catalog'
import type { ProductInput } from '@/services/catalog'

export type StaffMember = {
  uid: string
  name: string
  email: string
}

export type AdminOrdersQuery = {
  role: 'admin' | 'delivery'
  uid: string
}

/**
 * Live order feed for the admin panel. Admins see everything; delivery staff
 * only ever receive orders assigned to them (and Firestore rules enforce it).
 */
export function subscribeAdminOrders(
  options: AdminOrdersQuery,
  onOrders: (orders: Order[]) => void,
  onError: (error: unknown) => void,
): () => void {
  const db = getDb()

  const adminQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(200))
  const deliveryQuery = query(
    collection(db, 'orders'),
    where('assignedTo', '==', options.uid),
    limit(100),
  )

  return onSnapshot(
    options.role === 'delivery' ? deliveryQuery : adminQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((entry) =>
        mapOrder(entry.id, entry.data() as Record<string, unknown>),
      )
      onOrders(
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      )
    },
    (error) => onError(error),
  )
}

/** Movement rules are checked here as well as in the UI. */
export async function updateOrderStatus(
  orderNumber: string,
  from: OrderStatus,
  to: OrderStatus,
  actor: string,
): Promise<void> {
  if (!canTransition(from, to)) {
    throw new Error(`An order cannot move from ${from} to ${to}.`)
  }

  await updateDoc(doc(getDb(), 'orders', orderNumber), {
    orderStatus: to,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({ status: to, at: Timestamp.now(), by: actor }),
  })
}

/** COD is only marked paid when staff confirm cash was received. */
export async function markOrderPaid(orderNumber: string): Promise<void> {
  await updateDoc(doc(getDb(), 'orders', orderNumber), {
    paymentStatus: 'PAID',
    updatedAt: serverTimestamp(),
  })
}

export async function assignDelivery(
  orderNumber: string,
  staff: StaffMember | null,
): Promise<void> {
  await updateDoc(doc(getDb(), 'orders', orderNumber), {
    assignedTo: staff?.uid ?? null,
    assignedToName: staff?.name ?? null,
    updatedAt: serverTimestamp(),
  })
}

export async function saveDeliveryNotes(orderNumber: string, notes: string): Promise<void> {
  await updateDoc(doc(getDb(), 'orders', orderNumber), {
    deliveryNotes: notes.trim().slice(0, 300) || null,
    updatedAt: serverTimestamp(),
  })
}

export async function fetchDeliveryStaff(): Promise<StaffMember[]> {
  const staffQuery = query(collection(getDb(), 'users'), where('role', '==', 'DELIVERY_STAFF'))
  const snapshot = await getDocs(staffQuery)

  return snapshot.docs.map((entry) => {
    const data = entry.data()
    return {
      uid: entry.id,
      name: String(data.name ?? 'Delivery staff'),
      email: String(data.email ?? ''),
    }
  })
}

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const safeName = file.name.replace(/[^\w.-]/g, '_')
  const storageRef = ref(getFirebaseStorage(), `products/${productId}/${Date.now()}-${safeName}`)
  await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(storageRef)
}

export async function saveProduct(
  productId: string | null,
  input: ProductInput,
): Promise<string> {
  if (!productId) return createProduct(input)

  await updateDoc(doc(getDb(), 'products', productId), {
    ...input,
    updatedAt: serverTimestamp(),
  })
  return productId
}

export async function updateProductAvailability(
  productId: string,
  patch: { isAvailable?: boolean; isActive?: boolean },
): Promise<void> {
  await updateDoc(doc(getDb(), 'products', productId), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

export async function updateStoreSettings(settings: StoreSettings): Promise<void> {
  await setDoc(
    doc(getDb(), 'settings/store'),
    {
      businessName: settings.businessName.trim().slice(0, 60),
      contactPhone: settings.contactPhone.trim().slice(0, 24),
      deliveryCharge: Math.max(0, Math.trunc(settings.deliveryCharge)),
      minimumOrder: Math.max(0, Math.trunc(settings.minimumOrder)),
      openingTime: settings.openingTime,
      closingTime: settings.closingTime,
      isOrderingOpen: settings.isOrderingOpen,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
