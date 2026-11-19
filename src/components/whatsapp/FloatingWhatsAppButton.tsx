import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { useCart } from '@/context/cartContext'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'

/**
 * Fixed WhatsApp entry point on customer pages. On phones it is a 60×60 circle
 * with the icon only; from `sm` up it becomes a 60px pill with the label.
 */
export function FloatingWhatsAppButton() {
  const { items, totals } = useCart()

  return (
    <a
      href={buildWhatsAppOrderUrl(items, totals)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp — opens WhatsApp chat"
      className="fixed bottom-5 right-4 z-40 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_38px_-18px_rgba(10,31,24,0.65)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#1DA851] sm:bottom-6 sm:right-6 sm:w-auto sm:gap-3 sm:px-6"
    >
      <WhatsAppIcon className="h-7 w-7 shrink-0" />
      <span className="hidden whitespace-nowrap text-sm font-semibold sm:inline">
        Order on WhatsApp
      </span>
    </a>
  )
}
