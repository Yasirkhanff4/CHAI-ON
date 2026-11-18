import { useEffect, useRef, useState } from 'react'
import { MapPin, Menu as MenuIcon, Phone, ShoppingBag, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/lib/buttonStyles'
import { business, navLinks } from '@/data/site'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-forest-900 text-cream-100">
        <Container className="flex h-9 items-center justify-between gap-4 text-[11px] tracking-wide">
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
            Fresh chai, delivered across G-11 Markaz
          </p>
          <div className="hidden items-center gap-6 sm:flex">
            <span className="text-cream-100/60">Open daily · {business.hours}</span>
            <a
              href={business.phoneHref}
              className="transition hover:text-gold-300"
            >
              {business.phoneDisplay}
            </a>
          </div>
        </Container>
      </div>

      <div className="border-b border-forest-900/10 bg-cream-100/92 backdrop-blur-md">
        <Container className="flex h-[74px] items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-cream-200/90 text-forest-900'
                      : 'text-forest-900/70 hover:bg-cream-200/50 hover:text-forest-900',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-full px-3 py-2 text-sm font-medium text-forest-900/75 transition hover:text-forest-900 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              to="/cart"
              aria-label="View cart"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest-900/12 bg-cream-50/60 text-forest-900 transition hover:border-forest-900/25 hover:bg-cream-50"
            >
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest-900/12 bg-cream-50/60 text-forest-900 transition hover:border-forest-900/25 hover:bg-cream-50 lg:hidden"
            >
              <MenuIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </Container>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-forest-950/55 backdrop-blur-sm"
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm animate-[slide-in_0.25s_ease-out] flex-col overflow-y-auto bg-cream-100 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <Logo size="sm" showTagline={false} />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-forest-900/12 text-forest-900 transition hover:bg-cream-200"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="mt-10 flex flex-col">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      'border-b border-cream-300/70 py-4 font-display text-2xl tracking-tight transition',
                      isActive ? 'text-forest-900' : 'text-forest-900/60 hover:text-forest-900',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 space-y-3">
              <Link
                to="/menu"
                onClick={() => setMenuOpen(false)}
                className={buttonClasses('primary', 'lg', 'w-full')}
              >
                Order now
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className={buttonClasses('secondary', 'lg', 'w-full')}
              >
                Log in
              </Link>
            </div>

            <div className="mt-auto space-y-3 border-t border-cream-300/70 pt-6 text-sm text-forest-900/70">
              <a href={business.phoneHref} className="flex items-center gap-3 hover:text-forest-900">
                <Phone className="h-4 w-4 text-tea-500" aria-hidden="true" />
                {business.phoneDisplay}
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tea-500" aria-hidden="true" />
                <span>
                  {business.addressLine1}
                  <br />
                  {business.addressLine2}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
