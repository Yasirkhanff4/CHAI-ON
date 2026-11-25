import { ArrowRight, Banknote, Clock, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { useCart } from '@/context/cartContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'

const proof = [
  { icon: Clock, label: '15–25 min' },
  { icon: Truck, label: 'Free office delivery' },
  { icon: Banknote, label: 'Cash on delivery' },
]

export function Hero() {
  const { items, totals } = useCart()

  return (
    <section className="pb-14 pt-5 sm:pb-20 sm:pt-8">
      <Container>
        <div className="overflow-hidden rounded-panel bg-off-white shadow-panel">
          <div className="grid items-stretch lg:grid-cols-[1.04fr_0.96fr]">
            <div className="flex flex-col justify-center px-5 pb-8 pt-9 sm:px-9 sm:pb-10 sm:pt-12 lg:px-12 lg:py-16">
              <p className="flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.16em] text-brand-brown/60">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red" aria-hidden="true" />
                G-11 Markaz, Islamabad
                <span className="text-brand-brown/30" aria-hidden="true">
                  /
                </span>
                <span className="normal-case tracking-normal">Open until 11 PM</span>
              </p>

              <h1 className="poster-title animate-rise mt-5 max-w-xl text-[44px] text-brand-brown sm:text-[58px] lg:text-[66px]">
                Your chai break just got better.
              </h1>

              <p className="animate-rise-1 mt-5 max-w-md text-[15.5px] leading-relaxed text-brand-brown/70">
                Chai, coffee, nuggets and cake rusk. Brewed when you order, carried up to your
                office desk.
              </p>

              <div className="animate-rise-2 mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <Link to="/menu" className={buttonClasses('primary', 'lg', 'w-full sm:w-auto')}>
                  Browse the menu
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={buildWhatsAppOrderUrl(items, totals)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses('secondary', 'lg', 'w-full sm:w-auto')}
                >
                  <WhatsAppIcon className="h-[18px] w-[18px] text-[#1DA851]" />
                  Order on WhatsApp
                </a>
              </div>

              <ul className="animate-rise-3 mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[12px] font-medium text-brand-brown/55">
                {proof.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-brand-red/80" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative m-2 min-h-[280px] overflow-hidden rounded-[1.4rem] bg-cream sm:m-3 sm:min-h-[360px] lg:my-3 lg:ml-0 lg:min-h-[480px]">
              <img
                src="/images/doodh-patti.jpg"
                alt="A warm cup of doodh patti chai on a wooden tray"
                width={1000}
                height={1250}
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover object-[50%_55%]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[1.4rem] ring-1 ring-inset ring-brand-brown/5"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
