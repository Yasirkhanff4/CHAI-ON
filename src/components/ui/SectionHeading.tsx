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
      className={[
        centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl',
        className,
      ].join(' ')}
    >
      {eyebrow && (
        <p
          className={[
            'flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em]',
            isLight ? 'text-gold-300' : 'text-tea-500',
            centered ? 'justify-center' : '',
          ].join(' ')}
        >
          <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2
        className={[
          'mt-4 font-display text-[30px] leading-[1.08] tracking-[-0.015em] sm:text-[38px] lg:text-[44px]',
          isLight ? 'text-cream-50' : 'text-forest-900',
        ].join(' ')}
      >
        {title}
      </h2>
      {description && (
        <p
          className={[
            'mt-4 text-[15px] leading-relaxed sm:text-base',
            isLight ? 'text-cream-100/70' : 'text-forest-900/70',
          ].join(' ')}
        >
          {description}
        </p>
      )}
    </div>
  )
}
