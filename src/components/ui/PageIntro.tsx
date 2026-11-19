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
    <section className="border-b border-cream-300/70 bg-cream-50/70">
      <Container className="py-8 sm:py-10">
        <p className="text-[13px] font-medium text-tea-600">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-[30px] leading-[1.12] text-forest-900 sm:text-[38px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-forest-900/70">
            {description}
          </p>
        )}
        {children}
      </Container>
    </section>
  )
}
