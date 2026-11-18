import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { strengthOptions, sugarOptions } from '@/data/menu'

function OptionGroup({
  label,
  options,
}: {
  label: string
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-300">
          {label}
        </h3>
        <span className="text-[10px] uppercase tracking-[0.14em] text-cream-100/60">
          Choose one
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <span
            key={option.value}
            className="rounded-full border border-cream-50/15 bg-cream-50/5 px-3.5 py-2 text-[13px] text-cream-100/85"
          >
            {option.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CustomizeTea() {
  return (
    <section className="relative overflow-hidden bg-forest-900 py-20 text-cream-50 sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full border border-cream-50/10" />
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full border border-gold-400/20" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
      </div>

      <Container className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            tone="light"
            eyebrow="Made your way"
            title="Sugar. Strength. Exactly how you like it."
            description="No long forms and no guesswork. Two simple choices and your chai goes to the kettle the way you take it."
          />

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-cream-100/60">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
              Always free
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
              Set per cup
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
              Saved with your order
            </span>
          </div>

          <Link to="/menu" className={buttonClasses('gold', 'lg', 'mt-9')}>
            Build your cup
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-[28px] border border-cream-50/12 bg-cream-50/[0.04] p-6 sm:p-8">
          <div className="space-y-7">
            <OptionGroup label="Sugar" options={sugarOptions} />
            <div className="h-px bg-cream-50/10" aria-hidden="true" />
            <OptionGroup label="Tea strength" options={strengthOptions} />
          </div>

          <p className="mt-7 border-t border-cream-50/10 pt-5 text-[11.5px] leading-relaxed text-cream-100/60">
            Pick your options on the menu, add the cup to your cart, and we will brew it
            to match.
          </p>
        </div>
      </Container>
    </section>
  )
}
