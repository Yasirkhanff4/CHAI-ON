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
      <h3 className="text-[13px] font-semibold text-cream/80">{label}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <span
            key={option.value}
            className="rounded-xl border border-off-white/15 px-3 py-1.5 text-[13px] text-cream/85"
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
    <section className="bg-brand-brown py-12 text-off-white sm:py-16">
      <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <SectionHeading
            tone="light"
            eyebrow="Your order"
            title="Sugar and strength, your way."
            description="Two quick choices for chai and coffee. No account and no long forms."
          />

          <Link to="/menu" className={buttonClasses('gold', 'lg', 'mt-6')}>
            Build your order
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-xl border border-off-white/15 p-5 sm:p-6">
          <div className="space-y-5">
            <OptionGroup label="Sugar" options={sugarOptions} />
            <OptionGroup label="Tea strength" options={strengthOptions} />
          </div>

          <p className="mt-5 border-t border-off-white/10 pt-4 text-[12.5px] leading-relaxed text-cream/60">
            Pick your options on the menu and add it to your cart.
          </p>
        </div>
      </Container>
    </section>
  )
}
