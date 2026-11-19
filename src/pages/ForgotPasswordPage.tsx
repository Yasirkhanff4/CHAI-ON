import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/ui/FormField'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function ForgotPasswordPage() {
  useDocumentTitle('Reset password — CHAI ON')
  const { resetPassword, status } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await resetPassword(email)
      setSent(true)
    } catch (resetError) {
      setError(describeFirebaseError(resetError, 'We could not send the reset email.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Reset your password."
      description="We will email you a secure link to choose a new password."
      footer={
        <p>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-forest-800 hover:text-forest-600">
            Back to log in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="rounded-[10px] border border-forest-200 bg-forest-50 px-4 py-4">
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-forest-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            If an account exists for {email}, a reset link is on its way. Check your spam
            folder too.
          </p>
        </div>
      ) : (
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

          <button
            type="submit"
            disabled={submitting || status === 'unconfigured'}
            className={buttonClasses('primary', 'lg', 'w-full')}
          >
            {submitting ? 'Sending…' : 'Send reset link'}
            {!submitting && <Mail className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
