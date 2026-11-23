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
    <section className="border-b border-soft-pink bg-off-white/70">
      <Container className="py-8 sm:py-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-red">
          {eyebrow}
        </p>
        <h1 className="poster-title mt-2 max-w-3xl text-[36px] text-brand-brown sm:text-[48px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-brand-brown/75">
            {description}
          </p>
        )}
        {children}
      </Container>
    </section>
  )
}
