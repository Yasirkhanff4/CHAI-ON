import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TeaCard } from '@/components/home/TeaCard'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { featuredProducts } from '@/data/menu'

export function PopularTeas() {
  return (
    <section id="menu-preview" className="py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="The menu"
            title="Two teas. Done properly."
            description="Start with a house classic or a bold, spiced karak. Both are brewed fresh and made your way."
          />
          <Link
            to="/menu"
            className={buttonClasses('secondary', 'md', 'hidden sm:inline-flex')}
          >
            Full menu
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:gap-8">
          {featuredProducts.map((product) => (
            <TeaCard key={product.id} product={product} />
          ))}
        </div>

        <Link
          to="/menu"
          className={buttonClasses('secondary', 'md', 'mt-6 w-full sm:hidden')}
        >
          Full menu
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Container>
    </section>
  )
}
