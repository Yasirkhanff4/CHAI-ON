import { useEffect, useRef, useState } from 'react'
import { ArrowRight, MapPin, Menu as MenuIcon, Phone, ShoppingBag, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { useCart } from '@/context/cartContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { business, navLinks } from '@/data/site'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { totals } = useCart()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        return
      }

      if (event.key !== 'Tab' || !drawerRef.current) return

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
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
      <div className="bg-brand-maroon text-off-white">
        <Container className="flex h-9 items-center justify-between gap-4 text-[11.5px] tracking-[0.01em]">
          <p className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-soft-pink/80" aria-hidden="true" />
            <span className="truncate">G-11 Markaz, Islamabad</span>
          </p>
          <div className="flex shrink-0 items-center gap-4 sm:gap-5">
            <span className="hidden text-off-white/60 sm:inline">
              Open daily, {business.hours}
            </span>
            <a href={business.phoneHref} className="transition-colors hover:text-soft-pink">
              {business.phoneDisplay}
            </a>
          </div>
        </Container>
      </div>

      <div className="border-b border-brand-brown/10 bg-cream/80 backdrop-blur-xl">
        <Container className="flex h-[68px] items-center justify-between gap-3">
          <Logo />

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  [
                    'relative rounded-full px-3.5 py-2 text-[14px] transition-colors duration-200 ease-smooth',
                    isActive
                      ? 'font-semibold text-brand-red after:absolute after:inset-x-3.5 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-red'
                      : 'font-medium text-brand-brown/65 hover:text-brand-brown',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              aria-label={
                totals.itemCount > 0
                  ? `View cart, ${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`
                  : 'View cart'
              }
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-brown/10 bg-off-white/70 text-brand-brown transition duration-200 ease-smooth hover:border-brand-brown/20 hover:bg-off-white"
            >
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
              {totals.itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-red px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-cream"
                >
                  {totals.itemCount > 99 ? '99+' : totals.itemCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-brown/10 bg-off-white/70 text-brand-brown transition duration-200 ease-smooth hover:border-brand-brown/20 hover:bg-off-white lg:hidden"
            >
              <MenuIcon className="h-[18px] w-[18px]" aria-hidden="true" />
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
            className="absolute inset-0 h-full w-full cursor-default bg-brand-brown/45 backdrop-blur-sm"
          />
          <div
            ref={drawerRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm animate-[slide-in_0.25s_ease-out] flex-col overflow-y-auto rounded-l-panel bg-off-white p-5 shadow-panel"
          >
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-brown/10 text-brand-brown transition-colors hover:bg-cream"
              >
                <X className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="mt-6 flex flex-col">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex min-h-12 items-center justify-between gap-3 border-b border-brand-brown/10 py-3 text-[16px] transition-colors',
                      isActive
                        ? 'font-semibold text-brand-red'
                        : 'font-medium text-brand-brown/65 hover:text-brand-brown',
                    ].join(' ')
                  }
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 opacity-40" aria-hidden="true" />
                </NavLink>
              ))}
            </nav>

            <div className="mt-6">
              <Link
                to="/menu"
                onClick={() => setMenuOpen(false)}
                className={buttonClasses('primary', 'lg', 'w-full')}
              >
                View menu
              </Link>
            </div>

            <div className="mt-auto space-y-3 border-t border-brand-brown/10 pt-5 text-sm text-brand-brown/65">
              <a
                href={business.phoneHref}
                className="flex min-h-11 items-center gap-2.5 transition-colors hover:text-brand-brown"
              >
                <Phone className="h-4 w-4 text-brand-red" aria-hidden="true" />
                {business.phoneDisplay}
              </a>
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
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
