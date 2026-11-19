export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] font-semibold transition duration-150 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-forest-800 text-cream-50 hover:bg-forest-700',
  secondary:
    'border border-forest-900/15 bg-cream-50 text-forest-900 hover:border-forest-900/30 hover:bg-cream-100',
  gold: 'bg-gold-400 text-forest-950 hover:bg-gold-300',
  ghost: 'text-forest-800 hover:bg-forest-800/5',
  inverse: 'border border-cream-50/30 text-cream-50 hover:border-cream-50/50 hover:bg-cream-50/10',
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
