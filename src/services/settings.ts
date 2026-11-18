import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { DEFAULT_STORE_SETTINGS } from '@/data/settings'
import type { StoreSettings } from '@/data/settings'
import { getDb, isFirebaseConfigured } from '@/lib/firebase/config'

export const SETTINGS_DOC_PATH = 'settings/store'

export function mapSettings(data: Record<string, unknown>): StoreSettings {
  const deliveryCharge = Number(data.deliveryCharge)
  const minimumOrder = Number(data.minimumOrder)

  return {
    businessName: String(data.businessName ?? DEFAULT_STORE_SETTINGS.businessName),
    contactPhone: String(data.contactPhone ?? DEFAULT_STORE_SETTINGS.contactPhone),
    deliveryCharge: Number.isFinite(deliveryCharge)
      ? Math.max(0, Math.trunc(deliveryCharge))
      : DEFAULT_STORE_SETTINGS.deliveryCharge,
    minimumOrder: Number.isFinite(minimumOrder)
      ? Math.max(0, Math.trunc(minimumOrder))
      : DEFAULT_STORE_SETTINGS.minimumOrder,
    openingTime: String(data.openingTime ?? DEFAULT_STORE_SETTINGS.openingTime),
    closingTime: String(data.closingTime ?? DEFAULT_STORE_SETTINGS.closingTime),
    isOrderingOpen: data.isOrderingOpen !== false,
  }
}

/** Live storefront settings; falls back to launch defaults if unavailable. */
export function subscribeSettings(
  onSettings: (settings: StoreSettings) => void,
  onError: (error: unknown) => void,
): () => void {
  if (!isFirebaseConfigured) return () => {}

  return onSnapshot(
    doc(getDb(), SETTINGS_DOC_PATH),
    (snapshot) => {
      if (!snapshot.exists()) {
        onSettings(DEFAULT_STORE_SETTINGS)
        return
      }
      onSettings(mapSettings(snapshot.data() as Record<string, unknown>))
    },
    (error) => onError(error),
  )
}

export async function fetchSettings(): Promise<StoreSettings> {
  if (!isFirebaseConfigured) return DEFAULT_STORE_SETTINGS

  const snapshot = await getDoc(doc(getDb(), SETTINGS_DOC_PATH))
  if (!snapshot.exists()) return DEFAULT_STORE_SETTINGS
  return mapSettings(snapshot.data() as Record<string, unknown>)
}
