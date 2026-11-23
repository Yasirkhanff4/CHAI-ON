import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TeaCard } from '@/components/home/TeaCard'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCatalog } from '@/context/catalogContext'

export function PopularTeas() {
  const { products } = useCatalog()
  const featured = products.slice(0, 4)

  return (
    <section id="menu-preview" className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="From the menu"
            title="Something for every break"
            description="Chai, coffee, nuggets and cake rusk. Pick what your desk needs."
          />
          <Link
            to="/menu"
            className={buttonClasses('secondary', 'md', 'hidden sm:inline-flex')}
          >
            Full menu
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
          {featured.map((product) => (
            <TeaCard key={product.id} product={product} />
          ))}
        </div>

        <Link
          to="/menu"
          className={buttonClasses('secondary', 'md', 'mt-4 w-full sm:hidden')}
        >
          Full menu
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Container>
    </section>
  )
}
