import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TeaCard } from '@/components/home/TeaCard'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCatalog } from '@/context/catalogContext'

export function PopularTeas() {
  const { products } = useCatalog()

  return (
    <section id="menu-preview" className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Our tea"
            title="Two teas, made your way."
            description="Pick a cup, choose your sugar and strength, and we will brew it fresh."
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
          {products.map((product) => (
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
