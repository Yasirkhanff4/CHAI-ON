import { useState } from 'react'
import { DeliveryDetailsDialog } from '@/components/whatsapp/DeliveryDetailsDialog'
import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { useCart } from '@/context/cartContext'
import { buttonClasses } from '@/lib/buttonStyles'
import type { ButtonSize, ButtonVariant } from '@/lib/buttonStyles'

type WhatsAppOrderButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  label?: string
  className?: string
  iconClassName?: string
}

/**
 * Cart WhatsApp button. It opens the delivery details dialog first, and only
 * the dialog's "Send on WhatsApp" button opens a chat with the cart.
 */
export function WhatsAppOrderButton({
  variant = 'secondary',
  size = 'md',
  label = 'Order on WhatsApp',
  className = '',
  iconClassName = 'h-4 w-4 shrink-0',
}: WhatsAppOrderButtonProps) {
  const { items } = useCart()
  const [open, setOpen] = useState(false)
  const empty = items.length === 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={empty}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={buttonClasses(variant, size, className)}
      >
        <WhatsAppIcon className={iconClassName} />
        {empty ? 'Add items to your cart first' : label}
      </button>

      {open && <DeliveryDetailsDialog onClose={() => setOpen(false)} />}
    </>
  )
}
