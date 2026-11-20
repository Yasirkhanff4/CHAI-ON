import type { CustomerDetails } from '@/types/order'

export const CUSTOMER_DETAILS_STORAGE_KEY = 'chai-on:customer-details:v1'

export type SavedCustomerDetails = Pick<
  CustomerDetails,
  'fullName' | 'building' | 'floor' | 'officeOrShop'
>

const FIELDS: (keyof SavedCustomerDetails)[] = [
  'fullName',
  'building',
  'floor',
  'officeOrShop',
]

/**
 * Reads the delivery details the customer last typed at checkout, so the
 * WhatsApp message can prefill the name and address lines.
 */
export function readSavedCustomerDetails(): SavedCustomerDetails | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(CUSTOMER_DETAILS_STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const record = parsed as Record<string, unknown>
    const details = {} as SavedCustomerDetails

    for (const field of FIELDS) {
      const value = record[field]
      details[field] = typeof value === 'string' ? value.trim() : ''
    }

    return details
  } catch {
    return null
  }
}

/** Stores the checkout details used in the WhatsApp message. */
export function saveCustomerDetails(details: SavedCustomerDetails): void {
  if (typeof window === 'undefined') return

  try {
    const trimmed: SavedCustomerDetails = {
      fullName: details.fullName.trim(),
      building: details.building.trim(),
      floor: details.floor.trim(),
      officeOrShop: details.officeOrShop.trim(),
    }

    window.localStorage.setItem(CUSTOMER_DETAILS_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // Storage can be unavailable (private mode / quota).
  }
}
