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
    <section className="relative overflow-hidden border-b border-brand-brown/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_20rem_at_15%_-4rem,rgb(252_250_246_/_0.95),transparent_70%)]"
      />
      <Container className="relative pb-10 pt-8 sm:pb-14 sm:pt-12">
        <p className="eyebrow text-brand-red">{eyebrow}</p>
        <h1 className="poster-title mt-3 max-w-3xl text-[38px] text-brand-brown sm:text-[52px]">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-brand-brown/70">
            {description}
          </p>
        )}
        {children}
      </Container>
    </section>
  )
}
