import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'

type PageIntroProps = {
  eyebrow: string
  title: string
  description?: string
  children?: ReactNode
}

export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <section className="relative overflow-hidden border-b border-cream-300/60 bg-cream-50/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-gold-200/40 blur-3xl"
      />
      <Container className="relative py-14 sm:py-18 lg:py-20">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-tea-500">
          <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-[40px] leading-[1.02] tracking-[-0.02em] text-forest-900 sm:text-5xl lg:text-[56px]">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-forest-900/70 sm:text-base">
            {description}
          </p>
        )}
        {children}
      </Container>
    </section>
  )
}
