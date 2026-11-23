import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { business } from '@/data/site'

type WhatsAppActionBarProps = {
  href: string
  label?: string
  className?: string
}

/** Solid red action bar used in the hero, cart and footer. */
export function WhatsAppActionBar({
  href,
  label = `Order on WhatsApp: ${business.whatsappDisplay}`,
  className = '',
}: WhatsAppActionBarProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens WhatsApp chat)`}
      className={[
        'inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-red px-5 py-3 text-center text-[14px] font-semibold leading-tight text-white transition hover:bg-brand-maroon',
        className,
      ].join(' ')}
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </a>
  )
}
