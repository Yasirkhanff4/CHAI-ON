import { Link } from 'react-router-dom'

type LogoProps = {
  size?: 'sm' | 'md'
  onDark?: boolean
  showTagline?: boolean
  className?: string
}

export function Logo({
  size = 'md',
  onDark = false,
  showTagline = true,
  className = '',
}: LogoProps) {
  const markSize = size === 'sm' ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-2xl'
  const wordSize = size === 'sm' ? 'text-[17px]' : 'text-[21px]'

  return (
    <Link
      to="/"
      className={`group inline-flex shrink-0 items-center gap-3 ${className}`}
    >
      <span
        className={[
          'grid place-items-center transition duration-300 group-hover:-rotate-3',
          markSize,
          onDark
            ? 'bg-cream-50 text-forest-900'
            : 'bg-forest-900 text-cream-50 shadow-[0_10px_24px_-14px_rgba(20,52,42,0.9)]',
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

      <span className="flex flex-col">
        <span
          className={[
            'font-display font-semibold leading-none tracking-[0.17em]',
            wordSize,
            onDark ? 'text-cream-50' : 'text-forest-900',
          ].join(' ')}
        >
          CHAI
          <span className={onDark ? 'text-gold-300' : 'text-gold-700'}> ON</span>
        </span>
        {showTagline && (
          <span
            className={[
              'mt-1.5 text-[9px] font-medium uppercase tracking-[0.23em]',
              onDark ? 'text-cream-200/60' : 'text-forest-900/75',
            ].join(' ')}
          >
            Your Office. Your Chai.
          </span>
        )}
      </span>
    </Link>
  )
}
