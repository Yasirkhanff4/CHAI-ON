import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/context/authContext'

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

/** Shared layout for the staff password-reset screen. */
export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  const { status } = useAuth()

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-md rounded-xl border border-cream-300 bg-cream-50 px-5 py-6 sm:px-7 sm:py-8">
          <p className="text-[13px] font-medium text-tea-600">{eyebrow}</p>
          <h1 className="mt-1.5 text-[26px] leading-tight text-forest-900">{title}</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-forest-900/70">{description}</p>

          {status === 'unconfigured' && (
            <div className="mt-4 rounded-[10px] border border-gold-400/50 bg-gold-100 px-3.5 py-3">
              <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-forest-900/85">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
                <span>
                  Sign-in is not configured for this build. Add the Firebase environment
                  variables (see <code className="font-mono text-[11.5px]">DEPLOYMENT.md</code>)
                  to enable password reset.
                </span>
              </p>
            </div>
          )}

          <div className="mt-5">{children}</div>

          {footer && (
            <div className="mt-5 border-t border-cream-300 pt-4 text-[13px] text-forest-900/70">
              {footer}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
