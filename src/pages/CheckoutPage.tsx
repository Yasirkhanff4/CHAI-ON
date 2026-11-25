import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, ArrowLeft, Clock, Coffee, Phone } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary'
import { Container } from '@/components/ui/Container'
import { FormField } from '@/components/ui/FormField'
import { PageIntro } from '@/components/ui/PageIntro'
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
import { saveCustomerDetails } from '@/lib/customerDetails'
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
        description="Add something from the menu and your checkout will be waiting here."
      />
      <section className="py-10 sm:py-14">
        <Container>
          <div className="mx-auto max-w-lg rounded-card bg-off-white px-5 py-10 text-center shadow-card sm:px-8">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream text-brand-red">
              <Coffee className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-[22px] font-semibold leading-tight text-brand-brown">
              Nothing to check out yet
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-brand-brown/60">
              Pick something from the menu. Guest checkout means no account is needed.
            </p>
            <Link to="/menu" className={buttonClasses('primary', 'lg', 'mt-6 w-full sm:w-auto')}>
              Browse the menu
            </Link>
            <p className="mt-6 border-t border-brand-brown/10 pt-5 text-[12.5px] leading-relaxed text-brand-brown/60">
              Prefer to order by phone? Call{' '}
              <a
                href={business.phoneHref}
                className="inline-flex items-center gap-1 font-semibold text-brand-red transition-colors hover:text-brand-maroon"
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
  useDocumentTitle('Checkout | CHAYON')
  const { items } = useCart()

  if (items.length === 0) return <EmptyCheckout />

  return <CheckoutFlow />
}

function CheckoutFlow() {
  const navigate = useNavigate()
  const { items, totals, clearCart } = useCart()
  const { products } = useCatalog()
  const { settings } = useStoreSettings()

  const [details, setDetails] = useState<CustomerDetails>({ ...emptyDetails })
  const [errors, setErrors] = useState<CustomerDetailsErrors>({})
  const [touched, setTouched] = useState<Partial<Record<CustomerDetailsField, boolean>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const orderingOpen = isOrderingOpen(settings)
  const belowMinimum = totals.subtotal < settings.minimumOrder
  const shortfall = settings.minimumOrder - totals.subtotal

  const updateField = (field: CustomerDetailsField) => (value: string) => {
    const next = { ...details, [field]: value }
    setDetails(next)
    saveCustomerDetails(next)
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
      setFormError('Your cart is empty. Add something from the menu before placing an order.')
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
        },
        { products, settings },
      )

      // Only clear the cart once the order is safely stored.
      saveCustomerDetails(normalizeCustomerDetails(details))
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
        eyebrow="Checkout"
        title="Where should we bring it?"
        description="Pay in cash when it arrives. No account and no card needed."
      />

      <section aria-label="Checkout" className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
            <form
              id={FORM_ID}
              onSubmit={handleSubmit}
              noValidate
              className="order-1 rounded-card bg-off-white px-5 py-6 shadow-card sm:px-6"
            >
              <div className="border-b border-brand-brown/10 pb-3">
                <h2 className="text-[20px] leading-tight text-brand-brown">Delivery details</h2>
              </div>

              <p className="mt-3 text-[12.5px] leading-relaxed text-brand-brown/55">
                Checking out as a guest. No account needed.{' '}
                Fields marked{' '}
                <span className="text-brand-red" aria-hidden="true">
                  *
                </span>{' '}
                are required so we can find you.
              </p>

              {!orderingOpen && (
                <div className="mt-4 rounded-xl bg-brand-red/[0.05] px-4 py-3">
                  <p className="flex items-start gap-2 text-[13px] leading-relaxed text-brand-brown/80">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-maroon" aria-hidden="true" />
                    <span>
                      Online ordering is paused. Our hours are {formatClock(settings.openingTime)} to{' '}
                      {formatClock(settings.closingTime)}. Call us to order in the meantime.
                    </span>
                  </p>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mt-4 rounded-xl bg-soft-pink/25 px-4 py-3"
                >
                  <p className="flex items-start gap-2 text-[13px] leading-relaxed text-brand-red">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{formError}</span>
                  </p>
                  {unavailable.length > 0 && (
                    <p className="mt-2 pl-6 text-[12.5px] leading-relaxed text-brand-red/85">
                      <Link to="/cart" className="font-semibold underline underline-offset-2">
                        Review your cart
                      </Link>{' '}
                      to remove unavailable items, then come back to place the order.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                  label="Building / plaza"
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
                  label="Office / shop number"
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
                  hint="Anything that helps us deliver faster."
                  maxLength={300}
                  className="sm:col-span-2"
                  disabled={submitting}
                />
              </div>

              <div className="mt-4 rounded-xl bg-cream px-4 py-3.5">
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-brand-brown/45">
                  Payment
                </p>
                <p className="mt-1.5 text-[14px] font-semibold text-brand-brown">
                  Cash on delivery
                </p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-brand-brown/55">
                  Pay {formatPKR(totals.total)} in cash when your order arrives.
                </p>
              </div>

              {belowMinimum && (
                <p className="mt-4 rounded-xl bg-cream px-3.5 py-2.5 text-[12.5px] leading-relaxed text-brand-brown/70">
                  Add {formatPKR(shortfall)} more to reach the minimum order of{' '}
                  {formatPKR(settings.minimumOrder)}.
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-brown/10 pt-4 lg:hidden">
                <Link
                  to="/cart"
                  className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-medium text-brand-brown/70 hover:text-brand-brown"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Cart
                </Link>
                <span className="text-[14px] font-semibold tabular-nums text-brand-brown">
                  {formatPKR(totals.total)}
                </span>
              </div>
            </form>

            <aside aria-label="Order summary" className="order-2 lg:sticky lg:top-28">
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
