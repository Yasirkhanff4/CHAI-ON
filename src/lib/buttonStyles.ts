export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition duration-200 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-forest-800 text-cream-50 shadow-[0_14px_30px_-16px_rgba(20,52,42,0.85)] hover:-translate-y-0.5 hover:bg-forest-700',
  secondary:
    'border border-forest-900/15 bg-cream-50/70 text-forest-900 hover:border-forest-900/30 hover:bg-cream-50',
  gold: 'bg-gold-400 text-forest-950 shadow-[0_14px_30px_-16px_rgba(10,31,24,0.6)] hover:-translate-y-0.5 hover:bg-gold-300',
  ghost: 'text-forest-800 hover:bg-forest-800/5',
  inverse:
    'border border-cream-50/25 text-cream-50 hover:border-cream-50/40 hover:bg-cream-50/10',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[15px]',
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
