/**
 * Single source of truth for the business details shown across the site.
 * These values are hard-coded for Phase 1 and will be replaced by the
 * Firestore `settings` document in a later phase.
 */
export const business = {
  name: 'CHAI ON',
  tagline: 'Your Office. Your Chai.',
  /**
   * TODO(launch): replace with the real CHAI ON phone number.
   * The placeholder keeps every `tel:` link functional during development.
   */
  phoneDisplay: '+92 300 000 0000',
  phoneHref: 'tel:+923000000000',
  addressLine1: '3rd Floor, Al Ghaffar Mall',
  addressLine2: 'G-11 Markaz, Islamabad',
  hours: '9:00 AM – 11:00 PM',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Al+Ghaffar+Mall+G-11+Markaz+Islamabad',
  deliveryArea: 'G-11 Markaz and the buildings around Al Ghaffar Mall',
} as const

export type NavLink = {
  label: string
  to: string
}

export const navLinks: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'Track Order', to: '/track' },
  { label: 'Contact', to: '/contact' },
]

/**
 * Storefront pricing rules for Phase 2.
 * These move into the Firestore `settings` document (managed from the admin
 * panel) in a later phase.
 */
export const orderSettings = {
  /** Flat delivery charge in PKR. 0 means free delivery within G-11 Markaz. */
  deliveryCharge: 0,
  /** Optional minimum order in PKR. 0 means there is no minimum. */
  minimumOrder: 0,
  /** Maximum cups a customer can add for one product/customization line. */
  maxQuantityPerLine: 20,
} as const

