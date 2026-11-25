import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className = '',
}: SectionHeadingProps) {
  const centered = align === 'center'
  const isLight = tone === 'light'

  return (
    <div
      className={[centered ? 'mx-auto max-w-xl text-center' : 'max-w-xl', className].join(' ')}
    >
      {eyebrow && (
        <p
          className={[
            'eyebrow',
            isLight ? 'text-soft-pink' : 'text-brand-red',
          ].join(' ')}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={[
          'poster-title mt-3 text-[34px] sm:text-[44px]',
          isLight ? 'text-off-white' : 'text-brand-brown',
        ].join(' ')}
      >
        {title}
      </h2>
      {description && (
        <p
          className={[
            'mt-4 text-[15px] leading-relaxed',
            isLight ? 'text-off-white/75' : 'text-brand-brown/70',
          ].join(' ')}
        >
          {description}
        </p>
      )}
    </div>
  )
}
