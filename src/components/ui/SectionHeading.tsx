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
            'text-[12px] font-semibold uppercase tracking-[0.18em]',
            isLight ? 'text-soft-pink' : 'text-brand-red',
          ].join(' ')}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={[
          'poster-title mt-2 text-[32px] sm:text-[42px]',
          isLight ? 'text-off-white' : 'text-brand-brown',
        ].join(' ')}
      >
        {title}
      </h2>
      {description && (
        <p
          className={[
            'mt-3 text-[14.5px] leading-relaxed',
            isLight ? 'text-off-white/75' : 'text-brand-brown/75',
          ].join(' ')}
        >
          {description}
        </p>
      )}
    </div>
  )
}
