import { useEffect, useRef, useState } from 'react'
import { MapPin, Menu as MenuIcon, Phone, ShoppingBag, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { useCart } from '@/context/cartContext'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { business, navLinks } from '@/data/site'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { totals } = useCart()
  const { isSignedIn } = useAuth()
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
      <div className="bg-forest-900 text-cream-100">
        <Container className="flex h-9 items-center justify-between gap-4 text-[12px]">
          <p className="truncate">G-11 Markaz, Islamabad</p>
          <div className="hidden items-center gap-5 sm:flex">
            <span className="text-cream-100/75">Open daily · {business.hours}</span>
            <a href={business.phoneHref} className="transition hover:text-gold-300">
              {business.phoneDisplay}
            </a>
          </div>
        </Container>
      </div>

      <div className="border-b border-forest-900/10 bg-cream-100/95 backdrop-blur-md">
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
                    'rounded-[10px] px-3.5 py-2 text-[15px] transition',
                    isActive
                      ? 'bg-cream-200 font-semibold text-forest-900'
                      : 'font-medium text-forest-900/70 hover:bg-cream-200/60 hover:text-forest-900',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to={isSignedIn ? '/account' : '/login'}
              className="hidden px-2 py-2 text-sm font-medium text-forest-900/75 transition hover:text-forest-900 sm:inline-flex"
            >
              {isSignedIn ? 'Account' : 'Log in'}
            </Link>
            <Link
              to="/cart"
              aria-label={
                totals.itemCount > 0
                  ? `View cart, ${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`
                  : 'View cart'
              }
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-forest-900/12 text-forest-900 transition hover:border-forest-900/25 hover:bg-cream-200/60"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {totals.itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-forest-800 px-1 text-[10px] font-semibold leading-none text-cream-50 ring-2 ring-cream-100"
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-forest-900/12 text-forest-900 transition hover:border-forest-900/25 hover:bg-cream-200/60 lg:hidden"
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
            className="absolute inset-0 h-full w-full cursor-default bg-forest-950/55"
          />
          <div
            ref={drawerRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm animate-[slide-in_0.2s_ease-out] flex-col overflow-y-auto border-l border-cream-300 bg-cream-100 p-5"
          >
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-forest-900/12 text-forest-900 transition hover:bg-cream-200"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="mt-5 flex flex-col border-t border-cream-300">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex min-h-12 items-center border-b border-cream-300 py-3 text-[17px] transition',
                      isActive
                        ? 'font-semibold text-forest-900'
                        : 'font-medium text-forest-900/65 hover:text-forest-900',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to={isSignedIn ? '/account' : '/login'}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center border-b border-cream-300 py-3 text-[17px] font-medium text-forest-900/65 transition hover:text-forest-900"
              >
                {isSignedIn ? 'Account' : 'Log in'}
              </NavLink>
            </nav>

            <div className="mt-5 space-y-2.5">
              <Link
                to="/menu"
                onClick={() => setMenuOpen(false)}
                className={buttonClasses('primary', 'lg', 'w-full')}
              >
                Order now
              </Link>
            </div>

            <div className="mt-auto space-y-2 border-t border-cream-300 pt-5 text-sm text-forest-900/70">
              <a
                href={business.phoneHref}
                className="flex min-h-11 items-center gap-2.5 hover:text-forest-900"
              >
                <Phone className="h-4 w-4 text-tea-500" aria-hidden="true" />
                {business.phoneDisplay}
              </a>
              <p className="flex items-start gap-2.5">
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
