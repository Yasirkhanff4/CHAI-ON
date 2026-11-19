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
            'text-[13px] font-medium',
            isLight ? 'text-gold-300' : 'text-tea-600',
          ].join(' ')}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={[
          'mt-2 text-[24px] leading-[1.15] sm:text-[30px]',
          isLight ? 'text-cream-50' : 'text-forest-900',
        ].join(' ')}
      >
        {title}
      </h2>
      {description && (
        <p
          className={[
            'mt-3 text-[14.5px] leading-relaxed',
            isLight ? 'text-cream-100/70' : 'text-forest-900/70',
          ].join(' ')}
        >
          {description}
        </p>
      )}
    </div>
  )
}
