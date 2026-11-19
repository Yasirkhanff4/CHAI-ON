import { Link } from 'react-router-dom'

type LogoProps = {
  size?: 'sm' | 'md'
  onDark?: boolean
  className?: string
}

export function Logo({ size = 'md', onDark = false, className = '' }: LogoProps) {
  const markSize = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'
  const wordSize = size === 'sm' ? 'text-[16px]' : 'text-[19px]'

  return (
    <Link to="/" className={`group inline-flex shrink-0 items-center gap-2.5 ${className}`}>
      <span
        className={[
          'grid place-items-center rounded-xl',
          markSize,
          onDark ? 'bg-cream-50 text-forest-900' : 'bg-forest-900 text-cream-50',
        ].join(' ')}
      >
        <svg
          viewBox="0 0 40 40"
          className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16.4 11.4c0-1.6 1.4-1.8 1.4-3.3 0-1.4-1.3-1.6-1.3-3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M22 11.4c0-1.6 1.4-1.8 1.4-3.3 0-1.4-1.3-1.6-1.3-3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.35"
          />
          <path
            d="M10.8 17.6h18.4v5.7a6.6 6.6 0 0 1-6.6 6.6h-5.2a6.6 6.6 0 0 1-6.6-6.6v-5.7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M29.2 19.6h1.8a3.5 3.5 0 0 1 0 7h-1.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M11 33.2h17.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </span>

      <span
        className={[
          'font-bold leading-none tracking-tight',
          wordSize,
          onDark ? 'text-cream-50' : 'text-forest-900',
        ].join(' ')}
      >
        CHAI
        <span className={onDark ? 'text-gold-300' : 'text-gold-700'}> ON</span>
      </span>
    </Link>
  )
}
