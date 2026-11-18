import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, ArrowLeft, Clock, Coffee, Phone } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary'
import { Container } from '@/components/ui/Container'
import { FormField } from '@/components/ui/FormField'
import { PageIntro } from '@/components/ui/PageIntro'
import { useAuth } from '@/context/authContext'
import { useCatalog } from '@/context/catalogContext'
import { useCart } from '@/context/cartContext'
import { useStoreSettings } from '@/context/settingsContext'
import { business } from '@/data/site'
import {
  focusFirstError,
  hasErrors,
  normalizeCustomerDetails,
  validateCustomerDetails,
} from '@/lib/checkoutValidation'
import { buttonClasses } from '@/lib/buttonStyles'
import { formatPKR } from '@/lib/format'
import { getCheckoutRequestKey, resetCheckoutRequestKey } from '@/lib/orders/idempotency'
import { isOrderingOpen, formatClock } from '@/lib/openingHours'
import { toOrderError } from '@/lib/orders/errors'
import { placeOrder } from '@/services/orders'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { CustomerDetails, CustomerDetailsErrors, CustomerDetailsField } from '@/types/order'

const FORM_ID = 'checkout-form'

const emptyDetails: CustomerDetails = {
  fullName: '',
  phone: '',
  building: '',
  floor: '',
  officeOrShop: '',
  deliveryInstructions: '',
}

function EmptyCheckout() {
  return (
    <>
      <PageIntro
        eyebrow="Checkout"
        title="Your cart is empty."
        description="Add a cup of Doodh Patti or Karak Chai and your checkout will be waiting here."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-lg rounded-[32px] border border-cream-300/80 bg-cream-50 px-6 py-12 text-center shadow-card sm:px-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream-200 text-tea-600">
              <Coffee className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-[28px] leading-tight text-forest-900">
              Nothing to check out yet
            </h2>
            <p className="mx-auto mt-3 max-w-xs text-[14px] leading-relaxed text-forest-900/70">
              Pick your teas, sugar and strength. Guest checkout means no account is ever needed.
            </p>
            <Link to="/menu" className={buttonClasses('primary', 'lg', 'mt-7 w-full sm:w-auto')}>
              Browse the menu
            </Link>
            <p className="mt-6 border-t border-cream-300/70 pt-5 text-[12px] leading-relaxed text-forest-900/70">
              Prefer to order by phone? Call{' '}
              <a
                href={business.phoneHref}
                className="inline-flex items-center gap-1 font-semibold text-forest-800 hover:text-forest-600"
              >
                <Phone className="h-3 w-3" aria-hidden="true" />
                {business.phoneDisplay}
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}

export function CheckoutPage() {
  useDocumentTitle('Checkout — CHAI ON')
  const { items } = useCart()
  const { profile } = useAuth()

  if (items.length === 0) return <EmptyCheckout />

  // Re-keying keeps the form state correct when the session resolves after the
  // first render, and prefills saved details for signed-in customers.
  return (
    <CheckoutFlow
      key={profile?.uid ?? 'guest'}
      initialName={profile?.name ?? ''}
      initialPhone={profile?.phone ?? ''}
      customerId={profile?.uid ?? null}
    />
  )
}

type CheckoutFlowProps = {
  initialName: string
  initialPhone: string
  customerId: string | null
}

function CheckoutFlow({ initialName, initialPhone, customerId }: CheckoutFlowProps) {
  const navigate = useNavigate()
  const { items, totals, clearCart } = useCart()
  const { products } = useCatalog()
  const { settings } = useStoreSettings()

  const [details, setDetails] = useState<CustomerDetails>({
    ...emptyDetails,
    fullName: initialName,
    phone: initialPhone,
  })
  const [errors, setErrors] = useState<CustomerDetailsErrors>({})
  const [touched, setTouched] = useState<Partial<Record<CustomerDetailsField, boolean>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const orderingOpen = isOrderingOpen(settings)
  const belowMinimum = totals.subtotal < settings.minimumOrder
  const shortfall = settings.minimumOrder - totals.subtotal

  const updateField = (field: CustomerDetailsField) => (value: string) => {
    setDetails((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  const blurField = (field: CustomerDetailsField) => () => {
    setTouched((current) => ({ ...current, [field]: true }))
    const fieldErrors = validateCustomerDetails(details)
    setErrors((current) => {
      const next = { ...current }
      if (fieldErrors[field]) next[field] = fieldErrors[field]
      else delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setFormError(null)
    setUnavailable([])

    if (!orderingOpen) {
      setFormError('Online ordering is paused right now. Please call us to place your order.')
      return
    }

    if (items.length === 0) {
      setFormError('Your cart is empty. Add a tea before placing an order.')
      return
    }

    const fieldErrors = validateCustomerDetails(details)
    setErrors(fieldErrors)
    setTouched({
      fullName: true,
      phone: true,
      building: true,
      floor: true,
      officeOrShop: true,
      deliveryInstructions: true,
    })

    if (hasErrors(fieldErrors)) {
      focusFirstError(fieldErrors)
      return
    }

    setSubmitting(true)

    try {
      const order = await placeOrder(
        {
          details: normalizeCustomerDetails(details),
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            sugar: item.sugar,
            strength: item.strength,
          })),
          requestKey: getCheckoutRequestKey(),
          customerId,
        },
        { products, settings },
      )

      // Only clear the cart once the order is safely stored.
      resetCheckoutRequestKey()
      clearCart({ silent: true })
      navigate(`/order-confirmation/${order.orderNumber}`, { replace: true })
    } catch (error) {
      const orderError = toOrderError(error)
      setFormError(orderError.message)
      setUnavailable(orderError.unavailableProducts)
      if (hasErrors(orderError.fieldErrors)) {
        setErrors(orderError.fieldErrors)
        focusFirstError(orderError.fieldErrors)
      }
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Almost there"
        title="Checkout"
        description="Tell us where to bring your chai. Pay in cash when it arrives — no account, no card, no online payment."
      />

      <section aria-label="Checkout" className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-10">
            <form
              id={FORM_ID}
              onSubmit={handleSubmit}
              noValidate
              className="rounded-[28px] border border-cream-300/80 bg-cream-50 px-5 py-6 shadow-card sm:px-7 sm:py-7"
            >
              <div className="flex items-center justify-between gap-4 border-b border-cream-300/70 pb-4">
                <h2 className="font-display text-[26px] leading-tight tracking-[-0.01em] text-forest-900">
                  Delivery details
                </h2>
                {customerId ? (
                  <Link
                    to="/account"
                    className="rounded-full px-2.5 py-1.5 text-[12px] font-medium text-forest-800 transition hover:bg-cream-200/70"
                  >
                    Your account
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-full px-2.5 py-1.5 text-[12px] font-medium text-forest-800 transition hover:bg-cream-200/70"
                  >
                    Have an account?
                  </Link>
                )}
              </div>

              <p className="mt-4 text-[12.5px] leading-relaxed text-forest-900/65">
                {customerId
                  ? 'We saved your name and mobile number from your account. Edit anything that is different for this delivery.'
                  : 'Checking out as a guest. No account needed.'}{' '}
                Fields marked{' '}
                <span className="text-tea-600" aria-hidden="true">
                  *
                </span>{' '}
                are required so we can find you.
              </p>

              {!orderingOpen && (
                <div className="mt-5 rounded-2xl border border-gold-400/50 bg-gold-100 px-4 py-3.5">
                  <p className="flex items-start gap-2 text-[13px] font-medium leading-relaxed text-forest-900/85">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
                    <span>
                      Online ordering is paused. Our hours are {formatClock(settings.openingTime)} –{' '}
                      {formatClock(settings.closingTime)}. Call us to order in the meantime.
                    </span>
                  </p>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mt-5 rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3.5"
                >
                  <p className="flex items-start gap-2 text-[13px] font-medium leading-relaxed text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{formError}</span>
                  </p>
                  {unavailable.length > 0 && (
                    <p className="mt-2 pl-6 text-[12.5px] leading-relaxed text-red-800/85">
                      <Link to="/cart" className="font-semibold underline underline-offset-2">
                        Review your cart
                      </Link>{' '}
                      to remove unavailable items, then come back to place the order.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FormField
                  id="fullName"
                  label="Full name"
                  value={details.fullName}
                  onChange={updateField('fullName')}
                  onBlur={blurField('fullName')}
                  error={touched.fullName ? errors.fullName : undefined}
                  required
                  placeholder="Ahmed Raza"
                  autoComplete="name"
                  maxLength={60}
                  className="sm:col-span-2"
                  disabled={submitting}
                />

                <FormField
                  id="phone"
                  label="Mobile number"
                  value={details.phone}
                  onChange={updateField('phone')}
                  onBlur={blurField('phone')}
                  error={touched.phone ? errors.phone : undefined}
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder="0300 1234567"
                  autoComplete="tel"
                  hint="We call this number if we cannot find your office."
                  maxLength={20}
                  className="sm:col-span-2"
                  disabled={submitting}
                />

                <FormField
                  id="building"
                  label="Building / Plaza"
                  value={details.building}
                  onChange={updateField('building')}
                  onBlur={blurField('building')}
                  error={touched.building ? errors.building : undefined}
                  required
                  placeholder="Al Ghaffar Mall"
                  autoComplete="organization"
                  maxLength={80}
                  disabled={submitting}
                />

                <FormField
                  id="floor"
                  label="Floor"
                  value={details.floor}
                  onChange={updateField('floor')}
                  onBlur={blurField('floor')}
                  error={touched.floor ? errors.floor : undefined}
                  required
                  placeholder="3rd Floor"
                  maxLength={20}
                  disabled={submitting}
                />

                <FormField
                  id="officeOrShop"
                  label="Office / Shop number"
                  value={details.officeOrShop}
                  onChange={updateField('officeOrShop')}
                  onBlur={blurField('officeOrShop')}
                  error={touched.officeOrShop ? errors.officeOrShop : undefined}
                  required
                  placeholder="Office 302"
                  maxLength={30}
                  disabled={submitting}
                />

                <FormField
                  id="deliveryInstructions"
                  label="Delivery instructions"
                  value={details.deliveryInstructions}
                  onChange={updateField('deliveryInstructions')}
                  onBlur={blurField('deliveryInstructions')}
                  error={touched.deliveryInstructions ? errors.deliveryInstructions : undefined}
                  multiline
                  rows={3}
                  placeholder="Ask for reception, or call when you reach the lobby."
                  hint="Optional — anything that helps us deliver faster."
                  maxLength={300}
                  className="sm:col-span-2"
                  disabled={submitting}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-cream-300 bg-cream-100/70 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tea-500">
                  Payment
                </p>
                <p className="mt-2 text-[13.5px] font-semibold text-forest-900">
                  Cash on delivery
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-forest-900/65">
                  Pay {formatPKR(totals.total)} in cash when your order arrives. Online payment
                  is not available yet.
                </p>
              </div>

              {belowMinimum && (
                <p className="mt-5 rounded-xl bg-gold-100 px-3.5 py-3 text-[12.5px] leading-relaxed text-forest-900/80">
                  Add {formatPKR(shortfall)} more to reach the minimum order of{' '}
                  {formatPKR(settings.minimumOrder)}.
                </p>
              )}

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-cream-300/70 pt-5 lg:hidden">
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-forest-900/70 hover:text-forest-900"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Cart
                </Link>
                <span className="text-[13px] font-semibold text-forest-900">
                  {formatPKR(totals.total)}
                </span>
              </div>
            </form>

            <aside aria-label="Order summary" className="lg:sticky lg:top-28">
              <CheckoutSummary
                formId={FORM_ID}
                submitting={submitting}
                disabled={belowMinimum || !orderingOpen}
              />
            </aside>
          </div>
        </Container>
      </section>
    </>
  )
}
