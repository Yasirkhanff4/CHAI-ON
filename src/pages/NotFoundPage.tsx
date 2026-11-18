import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Page not found — CHAI ON')

  return (
    <section className="relative overflow-hidden">
      <Container className="flex min-h-[62vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-[88px] leading-none text-forest-900/12 sm:text-[120px]">
          404
        </p>
        <h1 className="mt-2 font-display text-[32px] leading-tight tracking-[-0.015em] text-forest-900 sm:text-[40px]">
          This cup is not on the menu.
        </h1>
        <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-forest-900/60">
          The page you were looking for has moved, or it never existed. Let us get you
          back to the kettle.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className={buttonClasses('primary', 'md')}>
            Back to home
          </Link>
          <Link to="/contact" className={buttonClasses('secondary', 'md')}>
            Contact us
          </Link>
        </div>
      </Container>
    </section>
  )
}
