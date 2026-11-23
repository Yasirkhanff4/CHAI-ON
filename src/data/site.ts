/**
 * Single source of truth for the business details shown across the site.
 * These values are hard-coded for Phase 1 and will be replaced by the
 * Firestore `settings` document in a later phase.
 */
export const business = {
  name: 'CHAYON',
  tagline: 'Fresh to your office desk.',
  /** Primary CHAYON contact number, used for every `tel:` link. */
  phoneDisplay: '0309-1104343',
  phoneHref: 'tel:+923091104343',
  addressLine1: '3rd Floor, Al Ghaffar Mall',
  addressLine2: 'G-11 Markaz, Islamabad',
  hours: '9:00 AM to 11:00 PM',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Al+Ghaffar+Mall+G-11+Markaz+Islamabad',
  deliveryArea: 'G-11 Markaz and the buildings around Al Ghaffar Mall',
  /** WhatsApp ordering. International format, digits only. */
  whatsappNumber: '923091104343',
  whatsappDisplay: '0309-1104343',
  whatsappUrl: 'https://wa.me/923091104343',
  /** Pre-filled message for the first cup offer. */
  firstCupMessage: 'Assalam-o-Alaikum CHAYON! I want to claim the first cup free.',
} as const

/**
 * The first cup offer is a single controlled banner on the home page.
 * Set this to false to hide it everywhere without deleting the artwork.
 */
export const SHOW_FIRST_CUP_OFFER = true

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
  /** Maximum quantity a customer can add for one product/customization line. */
  maxQuantityPerLine: 20,
} as const
