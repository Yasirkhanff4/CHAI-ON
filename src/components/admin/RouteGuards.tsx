import type { ReactNode } from 'react'
import { AlertTriangle, Loader2, ShieldOff } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'

type GuardProps = {
  children: ReactNode
}

function CenteredCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <section className="py-16">
      <Container>
        <div className="mx-auto max-w-lg rounded-xl border border-cream-300/80 bg-cream-50 px-6 py-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream-200 text-forest-800">
            {icon}
          </span>
          <h1 className="mt-4 font-bold text-[26px] leading-tight text-forest-900">{title}</h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-forest-900/70">{description}</p>
          {action && <div className="mt-6">{action}</div>}
        </div>
      </Container>
    </section>
  )
}

/** Requires a signed-in admin or delivery staff account. */
export function RequireStaff({ children }: GuardProps) {
  const { status, profile, isAdmin, isDeliveryStaff } = useAuth()
  const location = useLocation()

  if (status === 'unconfigured') {
    return (
      <CenteredCard
        icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        title="Admin panel not configured"
        description="Add the Firebase environment variables (see DEPLOYMENT.md) and deploy the Cloud Functions to enable the admin panel."
        action={
          <Link to="/" className={buttonClasses('secondary', 'md')}>
            Back to the site
          </Link>
        }
      />
    )
  }

  if (status === 'loading') {
    return (
      <CenteredCard
        icon={<Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
        title="Checking access…"
        description="Verifying your staff session."
      />
    )
  }

  if (!profile) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin && !isDeliveryStaff) {
    return (
      <CenteredCard
        icon={<ShieldOff className="h-5 w-5" aria-hidden="true" />}
        title="Staff access only"
        description="This account is a customer account. Admin access is granted by CHAI ON using Firebase custom claims — there is no public admin registration."
        action={
          <Link to="/" className={buttonClasses('secondary', 'md')}>
            Back to the site
          </Link>
        }
      />
    )
  }

  return <>{children}</>
}

/** Admin-only routes (dashboard, products, settings). */
export function RequireAdmin({ children }: GuardProps) {
  const { isAdmin, status } = useAuth()

  if (status === 'ready' && !isAdmin) {
    return (
      <CenteredCard
        icon={<ShieldOff className="h-5 w-5" aria-hidden="true" />}
        title="Admins only"
        description="Delivery staff can see assigned deliveries and update their status, but not sales figures, products or settings."
        action={
          <Link to="/admin/orders" className={buttonClasses('primary', 'md')}>
            Go to orders
          </Link>
        }
      />
    )
  }

  return <>{children}</>
}
