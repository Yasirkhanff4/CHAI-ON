import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

/** Shared layout for customer sign-in, registration and password reset. */
export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  const { status } = useAuth()

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-200/40 blur-3xl"
      />
      <Container className="relative">
        <div className="mx-auto max-w-md rounded-[32px] border border-cream-300/80 bg-cream-50 px-6 py-8 shadow-card sm:px-9 sm:py-10">
          <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-tea-500">
            <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-[32px] leading-[1.06] tracking-[-0.015em] text-forest-900">
            {title}
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-forest-900/70">{description}</p>

          {status === 'unconfigured' && (
            <div className="mt-5 rounded-2xl border border-gold-400/50 bg-gold-100 px-4 py-3.5">
              <p className="flex items-start gap-2 text-[12.5px] font-medium leading-relaxed text-forest-900/85">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
                <span>
                  Accounts are not configured for this build. Add the Firebase environment
                  variables (see <code className="font-mono text-[11.5px]">DEPLOYMENT.md</code>)
                  to enable sign-in. Guest checkout keeps working without an account.
                </span>
              </p>
            </div>
          )}

          <div className="mt-6">{children}</div>

          {footer && (
            <div className="mt-6 border-t border-cream-300/70 pt-5 text-[13px] text-forest-900/70">
              {footer}
            </div>
          )}

          <Link
            to="/menu"
            className={buttonClasses('secondary', 'sm', 'mt-5 w-full')}
          >
            Order as a guest instead
          </Link>
        </div>
      </Container>
    </section>
  )
}
