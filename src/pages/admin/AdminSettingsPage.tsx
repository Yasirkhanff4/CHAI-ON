import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { FormField } from '@/components/ui/FormField'
import { DEFAULT_STORE_SETTINGS } from '@/data/settings'
import type { StoreSettings } from '@/data/settings'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { updateStoreSettings } from '@/services/admin'
import { fetchSettings } from '@/services/settings'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function AdminSettingsPage() {
  useDocumentTitle('Settings | CHAI ON Admin')
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchSettings()
      .then((result) => {
        if (!cancelled) {
          setSettings(result)
          setLoading(false)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(describeFirebaseError(loadError, 'Settings could not be loaded.'))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return

    if (!settings.businessName.trim()) {
      setError('Enter the business name.')
      return
    }
    if (settings.deliveryCharge < 0 || settings.minimumOrder < 0) {
      setError('Delivery charge and minimum order cannot be negative.')
      return
    }
    if (!/^\d{1,2}:\d{2}$/.test(settings.openingTime) || !/^\d{1,2}:\d{2}$/.test(settings.closingTime)) {
      setError('Enter opening and closing times as HH:MM, for example 09:00.')
      return
    }

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      await updateStoreSettings(settings)
      setSaved(true)
    } catch (saveError) {
      setError(describeFirebaseError(saveError, 'Settings could not be saved.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container>
      <div className="max-w-2xl">
        <h1 className="font-display text-[30px] leading-tight text-forest-900">Store settings</h1>
        <p className="mt-1 text-[13px] text-forest-900/65">
          These values drive the customer website: delivery charges, minimum order and ordering
          hours are checked again inside the trusted order function.
        </p>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-[13px] text-forest-900/60">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading settings…
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-5 rounded-[24px] border border-cream-300/80 bg-cream-50 p-5 shadow-card sm:p-6"
          >
            {error && (
              <p
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-red-800"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}
            {saved && (
              <p
                role="status"
                className="mb-4 flex items-start gap-2 rounded-xl bg-forest-50 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-forest-800"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Settings saved. The customer site updates immediately.
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="businessName"
                label="Business name"
                value={settings.businessName}
                onChange={(value) => update('businessName', value)}
                required
                maxLength={60}
                className="sm:col-span-2"
                disabled={saving}
              />
              <FormField
                id="contactPhone"
                label="Contact phone"
                value={settings.contactPhone}
                onChange={(value) => update('contactPhone', value)}
                required
                maxLength={24}
                className="sm:col-span-2"
                hint="Shown to customers for questions about an order."
                disabled={saving}
              />
              <FormField
                id="deliveryCharge"
                label="Delivery charge (PKR)"
                type="number"
                inputMode="numeric"
                value={String(settings.deliveryCharge)}
                onChange={(value) => update('deliveryCharge', Math.max(0, Number(value) || 0))}
                required
                hint="0 means free delivery."
                disabled={saving}
              />
              <FormField
                id="minimumOrder"
                label="Minimum order (PKR)"
                type="number"
                inputMode="numeric"
                value={String(settings.minimumOrder)}
                onChange={(value) => update('minimumOrder', Math.max(0, Number(value) || 0))}
                required
                hint="0 means no minimum."
                disabled={saving}
              />
              <FormField
                id="openingTime"
                label="Opening time"
                type="time"
                value={settings.openingTime}
                onChange={(value) => update('openingTime', value)}
                required
                hint="Pakistan Standard Time."
                disabled={saving}
              />
              <FormField
                id="closingTime"
                label="Closing time"
                type="time"
                value={settings.closingTime}
                onChange={(value) => update('closingTime', value)}
                required
                disabled={saving}
              />
            </div>

            <label className="mt-5 flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-100/60 px-4 py-3.5">
              <input
                type="checkbox"
                checked={settings.isOrderingOpen}
                onChange={(event) => update('isOrderingOpen', event.target.checked)}
                disabled={saving}
                className="mt-0.5 h-4 w-4 rounded border-forest-900/30 text-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
              />
              <span>
                <span className="block text-[13px] font-semibold text-forest-900">
                  Online ordering is open
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-forest-900/60">
                  Turn this off to pause new orders (for example when you run out of milk). The
                  menu stays visible and checkout explains that ordering is paused.
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className={buttonClasses('primary', 'md', 'mt-5 w-full sm:w-auto')}
            >
              {saving ? 'Saving…' : 'Save settings'}
              {!saving && <Save className="h-4 w-4" aria-hidden="true" />}
            </button>
          </form>
        )}
      </div>
    </Container>
  )
}
