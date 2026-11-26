import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import { FormField } from '@/components/ui/FormField'
import { useCart } from '@/context/cartContext'
import { buttonClasses } from '@/lib/buttonStyles'
import {
  CUSTOMER_DETAILS_STORAGE_KEY,
  readSavedCustomerDetails,
  saveCustomerDetails,
} from '@/lib/customerDetails'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'
import type { WhatsAppDeliveryDetails } from '@/lib/whatsapp'

type DeliveryDetailsDialogProps = {
  onClose: () => void
}

type FieldKey = keyof WhatsAppDeliveryDetails
type FieldErrors = Partial<Record<FieldKey, string>>

const EMPTY_DETAILS: WhatsAppDeliveryDetails = {
  fullName: '',
  building: '',
  floor: '',
  officeOrShop: '',
}

const FIELDS: { key: FieldKey; id: string; label: string; error: string; placeholder: string }[] = [
  {
    key: 'fullName',
    id: 'wa-order-name',
    label: 'Name',
    error: 'Enter your name.',
    placeholder: 'Your name',
  },
  {
    key: 'building',
    id: 'wa-order-building',
    label: 'Building / Plaza',
    error: 'Enter the building or plaza name.',
    placeholder: 'e.g. Al Ghaffar Mall',
  },
  {
    key: 'floor',
    id: 'wa-order-floor',
    label: 'Floor',
    error: 'Enter your floor, e.g. 3rd Floor.',
    placeholder: 'e.g. 3rd floor',
  },
  {
    key: 'officeOrShop',
    id: 'wa-order-office',
    label: 'Office / Shop',
    error: 'Enter your office or shop number.',
    placeholder: 'e.g. Office 302',
  },
]

function validate(details: WhatsAppDeliveryDetails): FieldErrors {
  const errors: FieldErrors = {}
  for (const field of FIELDS) {
    if (!details[field.key].trim()) errors[field.key] = field.error
  }
  return errors
}

/**
 * Collects the four delivery details before handing the cart to WhatsApp.
 * Details saved from an earlier order are prefilled but stay editable.
 */
export function DeliveryDetailsDialog({ onClose }: DeliveryDetailsDialogProps) {
  const { items, totals } = useCart()
  const [details, setDetails] = useState<WhatsAppDeliveryDetails>(
    () => readSavedCustomerDetails() ?? EMPTY_DETAILS,
  )
  const [errors, setErrors] = useState<FieldErrors>({})

  const hasValues = FIELDS.some((field) => details[field.key].trim() !== '')

  useEffect(() => {
    document.getElementById('wa-order-name')?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const updateField = (key: FieldKey) => (value: string) => {
    setDetails((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const clearAll = () => {
    setDetails(EMPTY_DETAILS)
    setErrors({})
    try {
      window.localStorage.removeItem(CUSTOMER_DETAILS_STORAGE_KEY)
    } catch {
      // Storage can be unavailable (private mode / quota).
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validate(details)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    saveCustomerDetails(details)

    // Opened inside the click handler so mobile popup blockers allow it.
    window.open(
      buildWhatsAppOrderUrl(items, totals, details),
      '_blank',
      'noopener,noreferrer',
    )
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-brown/45 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-details-title"
        onSubmit={handleSubmit}
        noValidate
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-off-white px-5 pb-6 pt-5 shadow-panel sm:max-w-md sm:rounded-card sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="delivery-details-title"
              className="text-[20px] font-semibold leading-tight text-brand-brown"
            >
              Delivery details
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-brand-brown/55">
              We send these with your order on WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close delivery details"
            className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-brand-brown/50 transition-colors hover:bg-cream hover:text-brand-brown"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          {FIELDS.map((field) => (
            <FormField
              key={field.key}
              id={field.id}
              label={field.label}
              value={details[field.key]}
              onChange={updateField(field.key)}
              error={errors[field.key]}
              required
              placeholder={field.placeholder}
              maxLength={80}
            />
          ))}
        </div>

        <div className="mt-2 flex justify-end">
          {hasValues && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex min-h-9 items-center rounded-full px-2 text-[12.5px] font-medium text-brand-brown/55 underline-offset-4 transition-colors hover:text-brand-brown hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <button type="submit" className={buttonClasses('primary', 'lg', 'mt-2 w-full')}>
          Send on WhatsApp
        </button>
      </form>
    </div>
  )
}
