import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { business } from '@/data/site'

type WhatsAppActionBarProps = {
  href: string
  label?: string
  tone?: 'light' | 'dark'
  className?: string
}

const tones = {
  light:
    'border border-brand-brown/15 bg-off-white text-brand-brown hover:border-brand-brown/25 hover:bg-cream',
  dark: 'border border-off-white/20 bg-off-white/5 text-off-white hover:border-off-white/35 hover:bg-off-white/10',
} as const

/** Quiet WhatsApp action used in the cart and footer. */
export function WhatsAppActionBar({
  href,
  label = `Order on WhatsApp: ${business.whatsappDisplay}`,
  tone = 'light',
  className = '',
}: WhatsAppActionBarProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens WhatsApp chat)`}
      className={[
        'inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-center text-[14px] font-semibold leading-tight transition duration-200 ease-smooth',
        tones[tone],
        className,
      ].join(' ')}
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#1DA851]" />
      <span>{label}</span>
    </a>
  )
}
