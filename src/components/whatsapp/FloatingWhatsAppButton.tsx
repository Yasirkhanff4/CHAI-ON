import { useLocation } from 'react-router-dom'
import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { useCart } from '@/context/cartContext'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'

/**
 * Small chat widget for customer pages. Cart and checkout already carry their
 * own WhatsApp button, so the floating chip stays out of their way.
 * Phones get a 48px green circle; from `sm` up it is a white chip with a label.
 */
export function FloatingWhatsAppButton() {
  const { items, totals } = useCart()
  const { pathname } = useLocation()

  if (pathname === '/cart' || pathname === '/checkout') return null

  return (
    <a
      href={buildWhatsAppOrderUrl(items, totals)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp (opens WhatsApp chat)"
      className="floating-chat fixed right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_2px_8px_rgba(10,31,24,0.28)] transition hover:bg-[#1DA851] sm:right-6 sm:h-auto sm:w-auto sm:grid-flow-col sm:auto-cols-max sm:items-center sm:gap-3 sm:rounded-full sm:border sm:border-brand-brown/12 sm:bg-off-white sm:py-1.5 sm:pl-1.5 sm:pr-4 sm:text-brand-brown sm:shadow-[0_1px_4px_rgba(20,52,42,0.14)] sm:hover:bg-cream"
    >
      <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white sm:h-9 sm:w-9">
        <WhatsAppIcon className="h-6 w-6 sm:h-5 sm:w-5" />
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 hidden h-2.5 w-2.5 rounded-full bg-[#25D366] ring-2 ring-off-white sm:block"
        />
      </span>
      <span className="hidden whitespace-nowrap text-sm font-semibold sm:inline">
        Order on WhatsApp
      </span>
    </a>
  )
}
