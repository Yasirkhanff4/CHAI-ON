import type { ReactNode } from 'react'
import { AlertTriangle, Loader2, UserRound } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'

type RequireAuthProps = {
  children: ReactNode
}

/** Customer-only pages: account, order history, order details. */
export function RequireAuth({ children }: RequireAuthProps) {
  const { status, profile, isAnonymous } = useAuth()
  const location = useLocation()

  if (status === 'unconfigured') {
    return (
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-lg rounded-[28px] border border-cream-300/80 bg-cream-50 px-6 py-10 text-center shadow-card">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream-200 text-forest-800">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-[26px] leading-tight text-forest-900">
              Accounts are not configured
            </h1>
            <p className="mt-3 text-[13.5px] leading-relaxed text-forest-900/70">
              Add the Firebase environment variables (see DEPLOYMENT.md) to enable customer
              accounts. Guest checkout is available now.
            </p>
            <Link to="/menu" className={buttonClasses('primary', 'md', 'mt-6')}>
              Order as a guest
            </Link>
          </div>
        </Container>
      </section>
    )
  }

  if (status === 'loading') {
    return (
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-lg rounded-[28px] border border-cream-300/80 bg-cream-50 px-6 py-12 text-center shadow-card">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-forest-700" aria-hidden="true" />
            <p className="mt-3 text-[13px] text-forest-900/60">Checking your session…</p>
          </div>
        </Container>
      </section>
    )
  }

  if (!profile || isAnonymous) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (profile.role !== 'CUSTOMER') {
    return (
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-lg rounded-[28px] border border-cream-300/80 bg-cream-50 px-6 py-10 text-center shadow-card">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream-200 text-forest-800">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-[26px] leading-tight text-forest-900">
              Staff account
            </h1>
            <p className="mt-3 text-[13.5px] leading-relaxed text-forest-900/70">
              This is a staff login. Use the admin panel to manage orders.
            </p>
            <Link to="/admin" className={buttonClasses('primary', 'md', 'mt-6')}>
              Open admin panel
            </Link>
          </div>
        </Container>
      </section>
    )
  }

  return <>{children}</>
}
