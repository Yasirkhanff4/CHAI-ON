import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, LogIn } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/ui/FormField'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function LoginPage() {
  useDocumentTitle('Log in — CHAI ON')
  const { login, status, profile, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isSignedIn && profile) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (loginError) {
      setError(describeFirebaseError(loginError, 'We could not sign you in. Please try again.'))
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Your account"
      title="Welcome back."
      description="Sign in to reuse your office details and see your past orders. Ordering as a guest always remains available."
      footer={
        <p>
          New here?{' '}
          <Link to="/register" className="font-semibold text-forest-800 hover:text-forest-600">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <div role="alert" className="rounded-[10px] border border-red-500/30 bg-red-50 px-4 py-3">
            <p className="flex items-start gap-2 text-[12.5px] font-medium leading-relaxed text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          </div>
        )}

        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
          placeholder="you@office.com"
          disabled={submitting || status === 'unconfigured'}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
          placeholder="Your password"
          disabled={submitting || status === 'unconfigured'}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-[12.5px] font-medium text-forest-800 hover:text-forest-600"
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
          {!submitting && <LogIn className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>
    </AuthShell>
  )
}
