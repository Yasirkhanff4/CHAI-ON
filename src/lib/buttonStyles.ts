export type ButtonVariant = 'primary' | 'secondary' | 'light' | 'gold' | 'ghost' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 ease-smooth active:translate-y-px disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-red text-white shadow-[0_1px_2px_rgb(91_58_46_/_0.16)] hover:bg-brand-maroon hover:shadow-[0_10px_24px_-14px_rgb(122_15_15_/_0.6)]',
  secondary:
    'border border-brand-brown/15 bg-off-white/80 text-brand-brown hover:border-brand-brown/25 hover:bg-off-white',
  light: 'bg-off-white text-brand-brown hover:bg-cream',
  // Kept as an alias for the old accent button; it now uses the brand red.
  gold: 'bg-brand-red text-white hover:bg-brand-maroon',
  ghost: 'text-brand-red hover:bg-brand-red/5',
  inverse:
    'border border-off-white/25 text-off-white hover:border-off-white/45 hover:bg-off-white/10',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 text-[13px]',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-6 text-[15px]',
}

/**
 * Shared button styling so links (`<Link>`, `<a>`) and `<button>` elements
 * always look and behave the same.
 */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = '',
): string {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(' ')
}
