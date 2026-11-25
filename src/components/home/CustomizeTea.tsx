import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { strengthOptions, sugarOptions } from '@/data/menu'

function OptionGroup({
  label,
  options,
  selected,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-brown/45">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option.value === selected
          return (
            <span
              key={option.value}
              className={[
                'inline-flex min-h-9 items-center rounded-full px-3 text-[12.5px] font-medium',
                active ? 'bg-brand-red text-white' : 'bg-cream text-brand-brown/65',
              ].join(' ')}
            >
              {option.label.replace(' Sugar', '')}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function CustomizeTea() {
  return (
    <section className="pb-16 sm:pb-24">
      <Container>
        <div className="rounded-panel bg-brand-maroon px-5 py-10 text-off-white shadow-panel sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <SectionHeading
                tone="light"
                eyebrow="Your order"
                title="Sugar and strength, your way."
                description="Two quick choices for chai and coffee. No account and no long forms."
              />

              <Link to="/menu" className={buttonClasses('light', 'lg', 'mt-7')}>
                Build your order
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-card bg-off-white p-5 text-brand-brown shadow-panel sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[16px] font-semibold leading-tight">Your cup</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-brand-brown/50">
                    Two choices, remembered for next time.
                  </p>
                </div>
                <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-brown/45">
                  Preview
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <OptionGroup label="Sugar" options={sugarOptions} selected="normal" />
                <OptionGroup label="Strength" options={strengthOptions} selected="normal" />
              </div>

              <p className="mt-5 border-t border-brand-brown/10 pt-4 text-[12px] leading-relaxed text-brand-brown/50">
                Pick these on the menu when you add a chai or coffee to your cart.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
