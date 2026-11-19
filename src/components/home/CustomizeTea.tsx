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
      <h3 className="text-[13px] font-semibold text-cream-100/80">{label}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <span
            key={option.value}
            className="rounded-[10px] border border-cream-50/15 px-3 py-1.5 text-[13px] text-cream-100/85"
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
    <section className="bg-forest-900 py-12 text-cream-50 sm:py-16">
      <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <SectionHeading
            tone="light"
            eyebrow="Your cup"
            title="Sugar and strength, your way."
            description="Two quick choices with every cup. No account and no long forms."
          />

          <Link to="/menu" className={buttonClasses('gold', 'lg', 'mt-6')}>
            Build your cup
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-xl border border-cream-50/15 p-5 sm:p-6">
          <div className="space-y-5">
            <OptionGroup label="Sugar" options={sugarOptions} />
            <OptionGroup label="Tea strength" options={strengthOptions} />
          </div>

          <p className="mt-5 border-t border-cream-50/10 pt-4 text-[12.5px] leading-relaxed text-cream-100/60">
            Pick your options on the menu and add the cup to your cart.
          </p>
        </div>
      </Container>
    </section>
  )
}
