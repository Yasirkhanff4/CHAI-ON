import { business, orderSettings } from '@/data/site'

export type StoreSettings = {
  businessName: string
  contactPhone: string
  deliveryCharge: number
  minimumOrder: number
  /** 24-hour "HH:MM" in Asia/Karachi. */
  openingTime: string
  closingTime: string
  /** Manual switch: when false, online ordering is paused. */
  isOrderingOpen: boolean
}

/**
 * Launch defaults. These mirror src/data/site.ts and are replaced by the
 * Firestore `settings/store` document as soon as it exists.
 */
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  businessName: business.name,
  contactPhone: business.phoneDisplay,
  deliveryCharge: orderSettings.deliveryCharge,
  minimumOrder: orderSettings.minimumOrder,
  openingTime: '09:00',
  closingTime: '23:00',
  isOrderingOpen: true,
}
