import { useEffect, useRef, useState } from 'react'
import { MapPin, Menu as MenuIcon, Phone, ShoppingBag, X } from 'lucide-react'
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
        <Container className="flex h-9 items-center justify-between gap-4 text-[12px]">
          <p className="truncate">G-11 Markaz, Islamabad</p>
          <div className="hidden items-center gap-5 sm:flex">
            <span className="text-off-white/80">Open daily, {business.hours}</span>
            <a href={business.phoneHref} className="transition hover:text-soft-pink">
              {business.phoneDisplay}
            </a>
          </div>
        </Container>
      </div>

      <div className="border-b border-soft-pink bg-off-white/95 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-3">
          <Logo />

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-3.5 py-2 text-[15px] transition',
                    isActive
                      ? 'bg-soft-pink/40 font-semibold text-brand-red'
                      : 'font-medium text-brand-brown/75 hover:bg-cream hover:text-brand-brown',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/cart"
              aria-label={
                totals.itemCount > 0
                  ? `View cart, ${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`
                  : 'View cart'
              }
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-soft-pink text-brand-brown transition hover:border-brand-red/40 hover:bg-cream"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {totals.itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-red px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-off-white"
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-soft-pink text-brand-brown transition hover:border-brand-red/40 hover:bg-cream lg:hidden"
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
            className="absolute inset-0 h-full w-full cursor-default bg-brand-maroon/60"
          />
          <div
            ref={drawerRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm animate-[slide-in_0.2s_ease-out] flex-col overflow-y-auto border-l border-soft-pink bg-off-white p-5"
          >
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-soft-pink text-brand-brown transition hover:bg-cream"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav
              aria-label="Mobile navigation"
              className="mt-5 flex flex-col border-t border-soft-pink"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex min-h-12 items-center border-b border-soft-pink py-3 text-[17px] transition',
                      isActive
                        ? 'font-semibold text-brand-red'
                        : 'font-medium text-brand-brown/75 hover:text-brand-brown',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-5 space-y-2.5">
              <Link
                to="/menu"
                onClick={() => setMenuOpen(false)}
                className={buttonClasses('primary', 'lg', 'w-full')}
              >
                View menu
              </Link>
            </div>

            <div className="mt-auto space-y-2 border-t border-soft-pink pt-5 text-sm text-brand-brown/75">
              <a
                href={business.phoneHref}
                className="flex min-h-11 items-center gap-2.5 hover:text-brand-brown"
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
