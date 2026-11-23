import { Link } from 'react-router-dom'

type LogoProps = {
  size?: 'sm' | 'md'
  onDark?: boolean
  className?: string
}

export function Logo({ size = 'md', onDark = false, className = '' }: LogoProps) {
  const markSize = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10 sm:h-11 sm:w-11'
  const wordSize = size === 'sm' ? 'text-[14px]' : 'text-[16px] sm:text-[19px]'

  return (
    <Link
      to="/"
      aria-label="CHAYON home"
      className={`group inline-flex shrink-0 items-center gap-2.5 ${className}`}
    >
      <span
        className={[
          'grid shrink-0 place-items-center overflow-hidden rounded-full',
          markSize,
          onDark ? 'bg-off-white' : 'bg-cream',
        ].join(' ')}
      >
        <img
          src="/brand/logo.webp"
          alt=""
          width={720}
          height={690}
          className="h-full w-full object-contain"
        />
      </span>

      <span
        className={[
          'font-sans font-bold leading-none tracking-[0.06em]',
          wordSize,
          onDark ? 'text-off-white' : 'text-brand-brown',
        ].join(' ')}
      >
        CHAY
        <span className={onDark ? 'text-soft-pink' : 'text-brand-red'}>ON</span>
      </span>
    </Link>
  )
}
