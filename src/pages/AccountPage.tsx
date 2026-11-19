import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, ClipboardList, LogOut, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { Container } from '@/components/ui/Container'
import { FormField } from '@/components/ui/FormField'
import { PageIntro } from '@/components/ui/PageIntro'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { formatDateTime, formatPKR } from '@/lib/format'
import { validatePakistaniPhone } from '@/lib/phone'
import { fetchMyOrders } from '@/services/orders'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { Order } from '@/types/order'

type LoadState = 'loading' | 'ready' | 'error'

export function AccountPage() {
  useDocumentTitle('Your account — CHAI ON')
  const { profile, updateProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return

    let cancelled = false
    fetchMyOrders(profile.uid)
      .then((result) => {
        if (cancelled) return
        setOrders(result)
        setState('ready')
        setOrdersError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState('error')
        setOrdersError(describeFirebaseError(error, 'Your orders could not be loaded.'))
      })

    return () => {
      cancelled = true
    }
  }, [profile, reloadToken])

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return

    setProfileError(null)
    setProfileSaved(false)

    if (name.trim().length < 2) {
      setProfileError('Enter your full name.')
      return
    }

    if (phone.trim()) {
      const phoneError = validatePakistaniPhone(phone)
      if (phoneError) {
        setProfileError(phoneError)
        return
      }
    }

    setSaving(true)
    try {
      await updateProfile({ name, phone })
      setProfileSaved(true)
    } catch (error) {
      setProfileError(describeFirebaseError(error, 'Your profile could not be saved.'))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <PageIntro
        eyebrow="Your account"
        title={profile ? `Hello, ${profile.name.split(' ')[0]}.` : 'Your account'}
        description="Keep your delivery details up to date and follow every order you have placed."
      />

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <div className="space-y-5">
              <div className="rounded-xl border border-cream-300/80 bg-cream-50 p-5 sm:p-6">
                <h2 className="font-bold text-[22px] leading-tight text-forest-900">Profile</h2>
                <p className="mt-1 text-[12px] text-forest-900/60">
                  {profile?.email}
                </p>

                <form onSubmit={handleProfileSave} noValidate className="mt-5 space-y-4">
                  {profileError && (
                    <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[12px] leading-relaxed text-red-800">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {profileError}
                    </p>
                  )}
                  {profileSaved && (
                    <p role="status" className="flex items-start gap-2 rounded-xl bg-forest-50 px-3 py-2.5 text-[12px] leading-relaxed text-forest-800">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      Saved.
                    </p>
                  )}

                  <FormField
                    id="profileName"
                    label="Full name"
                    value={name}
                    onChange={setName}
                    required
                    autoComplete="name"
                    maxLength={60}
                    disabled={saving}
                  />
                  <FormField
                    id="profilePhone"
                    label="Mobile number"
                    value={phone}
                    onChange={setPhone}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0300 1234567"
                    hint="Used to prefill checkout. Optional."
                    maxLength={20}
                    disabled={saving}
                  />

                  <button
                    type="submit"
                    disabled={saving}
                    className={buttonClasses('primary', 'md', 'w-full')}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </form>
              </div>

              <div className="rounded-xl border border-cream-300/80 bg-cream-50 p-5 sm:p-6">
                <h2 className="text-[12.5px] font-medium text-tea-500">
                  Session
                </h2>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={buttonClasses('secondary', 'md', 'mt-3 w-full')}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-cream-300/80 bg-cream-50">
              <div className="flex items-center justify-between gap-3 border-b border-cream-300/80 px-5 py-4">
                <h2 className="flex items-center gap-2 font-bold text-[22px] leading-tight text-forest-900">
                  <ClipboardList className="h-4.5 w-4.5 text-tea-500" aria-hidden="true" />
                  Your orders
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setState('loading')
                    setReloadToken((token) => token + 1)
                  }}
                  className="min-h-9 rounded-[8px] px-2 text-[12.5px] font-medium text-forest-900/70 transition hover:bg-cream-200/70"
                >
                  Refresh
                </button>
              </div>

              {state === 'loading' && (
                <div className="px-5 py-10 text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-forest-900/15 border-t-forest-800"
                  />
                  <p className="mt-3 text-[13px] text-forest-900/60">Loading your orders…</p>
                </div>
              )}

              {state === 'error' && (
                <p className="px-5 py-8 text-center text-[13px] text-red-700">
                  {ordersError}
                </p>
              )}

              {state === 'ready' && orders.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="font-bold text-xl text-forest-900">No orders yet</p>
                  <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-forest-900/65">
                    Your first order will appear here with its live status.
                  </p>
                  <Link to="/menu" className={buttonClasses('primary', 'md', 'mt-5')}>
                    Order a chai
                  </Link>
                </div>
              )}

              {state === 'ready' && orders.length > 0 && (
                <ul className="divide-y divide-cream-300/70">
                  {orders.map((order) => (
                    <li key={order.orderNumber}>
                      <Link
                        to={`/my-orders/${order.orderNumber}`}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-cream-100/70"
                      >
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-semibold text-forest-900">
                            {order.orderNumber}
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-forest-900/60">
                            {formatDateTime(order.createdAt)} · {order.itemCount}{' '}
                            {order.itemCount === 1 ? 'cup' : 'cups'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-semibold tabular-nums text-forest-900">
                            {formatPKR(order.total)}
                          </span>
                          <StatusBadge status={order.orderStatus} />
                          <ArrowRight className="h-4 w-4 text-forest-900/40" aria-hidden="true" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t border-cream-300/80 px-5 py-4 text-center">
                <Link
                  to="/track"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-forest-800 hover:text-forest-600"
                >
                  <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  Track an order without an account
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
