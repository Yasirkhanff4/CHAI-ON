import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/ui/FormField'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function RegisterPage() {
  useDocumentTitle('Create account — CHAI ON')
  const { register, status, isAnonymous } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors: Record<string, string> = {}
    if (name.trim().length < 2) nextErrors.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (password.length < 6) nextErrors.password = 'Use at least 6 characters.'
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setFormError(null)

    try {
      await register({ name, email, password })
      navigate('/account', { replace: true })
    } catch (registerError) {
      setFormError(
        describeFirebaseError(registerError, 'We could not create your account. Please try again.'),
      )
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Save your office details."
      description="Register once to keep your building, floor and office number ready for every order. No account is required to order."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-forest-800 hover:text-forest-600">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {isAnonymous && (
          <p className="rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-3 text-[12px] leading-relaxed text-forest-800">
            You are currently ordering as a guest. Creating an account now keeps every order you
            placed as a guest in your history.
          </p>
        )}

        {formError && (
          <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3">
            <p className="flex items-start gap-2 text-[12.5px] font-medium leading-relaxed text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {formError}
            </p>
          </div>
        )}

        <FormField
          id="name"
          label="Full name"
          value={name}
          onChange={setName}
          error={errors.name}
          required
          autoComplete="name"
          placeholder="Ahmed Raza"
          maxLength={60}
          disabled={submitting || status === 'unconfigured'}
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
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
          error={errors.password}
          required
          autoComplete="new-password"
          hint="At least 6 characters."
          disabled={submitting || status === 'unconfigured'}
        />
        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          disabled={submitting || status === 'unconfigured'}
        />

        <button
          type="submit"
          disabled={submitting || status === 'unconfigured'}
          aria-busy={submitting}
          className={buttonClasses('primary', 'lg', 'w-full')}
        >
          {submitting ? 'Creating account…' : 'Create account'}
          {!submitting && <UserPlus className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>
    </AuthShell>
  )
}
