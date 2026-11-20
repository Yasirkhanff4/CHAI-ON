import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { useCart } from '@/context/cartContext'
import { buttonClasses } from '@/lib/buttonStyles'
import type { ButtonSize, ButtonVariant } from '@/lib/buttonStyles'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'

type WhatsAppOrderButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  label?: string
  className?: string
  iconClassName?: string
  /** Shows the icon alone on very small screens (label from `sm` up). */
  compactOnMobile?: boolean
}

/**
 * Opens a WhatsApp chat with the shop, pre-filled with the current cart.
 * Cart contents stay on the device until the customer sends the message.
 */
export function WhatsAppOrderButton({
  variant = 'secondary',
  size = 'md',
  label = 'Order on WhatsApp',
  className = '',
  iconClassName = 'h-4 w-4 shrink-0',
  compactOnMobile = false,
}: WhatsAppOrderButtonProps) {
  const { items, totals } = useCart()

  return (
    <a
      href={buildWhatsAppOrderUrl(items, totals)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens WhatsApp chat)`}
      className={buttonClasses(variant, size, className)}
    >
      <WhatsAppIcon className={iconClassName} />
      {compactOnMobile ? <span className="hidden sm:inline">{label}</span> : label}
    </a>
  )
}
