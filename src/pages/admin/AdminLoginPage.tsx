import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { FormField } from '@/components/ui/FormField'
import { isStaffRole, useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function AdminLoginPage() {
  useDocumentTitle('Admin login | CHAYON')
  const { login, logout, status, profile, isAdmin, isDeliveryStaff } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (profile && (isAdmin || isDeliveryStaff)) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    if (!email.trim() || !password) {
      setError('Enter your staff email and password.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const signedIn = await login(email, password)

      if (!isStaffRole(signedIn.role)) {
        await logout()
        setError(
          'This is a customer account. Admin access is granted by CHAYON with Firebase custom claims. There is no public admin registration.',
        )
        setSubmitting(false)
        return
      }

      navigate('/admin', { replace: true })
    } catch (loginError) {
      setError(describeFirebaseError(loginError, 'We could not sign you in.'))
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-brand-maroon py-12">
      <Container>
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center">
            <Logo onDark />
          </div>

          <div className="mt-8 rounded-xl border border-off-white/15 bg-off-white px-6 py-8 shadow-lift sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-brown px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-off-white">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Staff access
            </span>
            <h1 className="mt-4 font-display text-[30px] leading-tight text-brand-brown">
              Admin sign in
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-brand-brown/70">
              Accounts are provisioned by the owner. Roles are verified by the server, so nothing
              here can grant admin access on its own.
            </p>

            {status === 'unconfigured' && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-cream px-3.5 py-3 text-[12px] leading-relaxed text-brand-brown/80">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-maroon" aria-hidden="true" />
                Firebase is not configured for this build. Add the VITE_FIREBASE_* variables to
                enable the admin panel.
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              {error && (
                <div role="alert" className="rounded-xl border border-brand-red/30 bg-soft-pink/30 px-4 py-3">
                  <p className="flex items-start gap-2 text-[12.5px] font-medium leading-relaxed text-brand-red">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                  </p>
                </div>
              )}

              <FormField
                id="adminEmail"
                label="Staff email"
                type="email"
                value={email}
                onChange={setEmail}
                required
                autoComplete="email"
                disabled={submitting || status === 'unconfigured'}
              />
              <FormField
                id="adminPassword"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                required
                autoComplete="current-password"
                disabled={submitting || status === 'unconfigured'}
              />

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-[12.5px] font-medium text-brand-red hover:text-brand-maroon"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting || status === 'unconfigured'}
                aria-busy={submitting}
                className={buttonClasses('primary', 'lg', 'w-full')}
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 border-t border-soft-pink/70 pt-4 text-center text-[11.5px] text-brand-brown/60">
              <Link to="/" className="font-medium text-brand-red hover:text-brand-maroon">
                Back to CHAYON
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
