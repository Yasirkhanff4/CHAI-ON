export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-semibold transition duration-150 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-red text-white hover:bg-brand-maroon',
  secondary:
    'border border-soft-pink bg-off-white text-brand-brown hover:border-brand-red/45 hover:bg-cream',
  // Kept as an alias for the old accent button; it now uses the brand red.
  gold: 'bg-brand-red text-white hover:bg-brand-maroon',
  ghost: 'text-brand-red hover:bg-brand-red/5',
  inverse:
    'border border-off-white/40 text-off-white hover:border-off-white/70 hover:bg-off-white/10',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 text-[13px]',
  md: 'min-h-11 px-4 text-sm',
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
