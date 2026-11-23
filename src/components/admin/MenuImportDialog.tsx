import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { CHAYON_MENU, featuredProducts } from '@/data/menu'
import type { ChayonMenuItem } from '@/data/menu'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { formatPKR } from '@/lib/format'
import { saveProduct } from '@/services/admin'
import type { Product } from '@/types'

type ImportRow = {
  item: ChayonMenuItem
  existing: Product | null
  status: 'new' | 'price' | 'same'
}

type MenuImportDialogProps = {
  products: Product[]
  onClose: () => void
  onImported: () => Promise<void> | void
}

function buildRows(products: Product[]): ImportRow[] {
  const byName = new Map(products.map((product) => [product.name.trim().toLowerCase(), product]))

  return CHAYON_MENU.map((item) => {
    const existing = byName.get(item.name.trim().toLowerCase()) ?? null
    if (!existing) return { item, existing: null, status: 'new' }
    return {
      item,
      existing,
      status: existing.price === item.price ? 'same' : 'price',
    }
  })
}

/**
 * Previews the CHAYON menu against what is already in Firestore.
 *
 * Nothing is written until the admin confirms. Existing products are matched
 * by name (case-insensitive); only their price changes. Products that are not
 * on the CHAYON menu are left untouched, and nothing is ever deleted.
 */
export function MenuImportDialog({ products, onClose, onImported }: MenuImportDialogProps) {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rows = useMemo(() => buildRows(products), [products])
  const newCount = rows.filter((row) => row.status === 'new').length
  const priceCount = rows.filter((row) => row.status === 'price').length
  const changeCount = newCount + priceCount

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const confirmImport = async () => {
    if (importing) return
    setImporting(true)
    setError(null)

    try {
      for (const row of rows) {
        if (row.status === 'same') continue

        if (row.existing) {
          const existing = row.existing
          await saveProduct(existing.id, {
            name: existing.name,
            description: existing.description,
            price: row.item.price,
            imageUrl: existing.imageUrl,
            imagePosition: existing.imagePosition ?? '50% 50%',
            badge: existing.badge ?? '',
            isAvailable: existing.isAvailable ?? true,
            isActive: existing.isActive ?? true,
            sortOrder: existing.sortOrder ?? 999,
          })
          continue
        }

        const matching = featuredProducts.find(
          (product) => product.name.trim().toLowerCase() === row.item.name.trim().toLowerCase(),
        )

        await saveProduct(null, {
          name: row.item.name,
          description: row.item.description,
          price: row.item.price,
          imageUrl: matching?.imageUrl ?? '/images/chayon-placeholder.webp',
          imagePosition: matching?.imagePosition ?? '50% 50%',
          badge: matching?.badge ?? '',
          isAvailable: true,
          isActive: true,
          sortOrder: row.item.sortOrder,
        })
      }

      await onImported()
      onClose()
    } catch (importError) {
      setError(
        describeFirebaseError(importError, 'The CHAYON menu could not be imported. Nothing else was changed.'),
      )
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close CHAYON menu preview"
        onClick={onClose}
        disabled={importing}
        className="absolute inset-0 h-full w-full cursor-default bg-brand-maroon/60"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-import-title"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-soft-pink bg-off-white shadow-card sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-soft-pink px-4 py-4 sm:px-5">
          <div>
            <h2
              id="menu-import-title"
              className="font-display text-[24px] leading-tight text-brand-brown"
            >
              Load CHAYON menu
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-brand-brown/65">
              {changeCount === 0
                ? 'Everything on the CHAYON menu is already up to date.'
                : `${newCount} new · ${priceCount} price ${
                    priceCount === 1 ? 'change' : 'changes'
                  }. Nothing is saved until you confirm.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            aria-label="Close CHAYON menu preview"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-brown/60 hover:bg-soft-pink disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
          {error && (
            <p
              role="alert"
              className="mb-3 flex items-start gap-2 rounded-xl border border-brand-red/30 bg-soft-pink/30 px-3.5 py-3 text-[12.5px] leading-relaxed text-brand-red"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <ul className="divide-y divide-soft-pink/70">
            {rows.map((row) => (
              <li key={row.item.name} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-brand-brown">{row.item.name}</p>
                  <p className="text-[11.5px] text-brand-brown/55">
                    {row.item.category} · {formatPKR(row.item.price)}
                  </p>
                </div>
                <span
                  className={[
                    'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-tight',
                    row.status === 'new'
                      ? 'bg-brand-red text-white'
                      : row.status === 'price'
                        ? 'bg-soft-pink/45 text-brand-maroon'
                        : 'bg-cream text-brand-brown/60',
                  ].join(' ')}
                >
                  {row.status === 'new' && 'New'}
                  {row.status === 'price' &&
                    `Price changes from ${formatPKR(row.existing?.price ?? 0)} to ${formatPKR(
                      row.item.price,
                    )}`}
                  {row.status === 'same' && 'No change'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-soft-pink px-4 py-3.5 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className={buttonClasses('secondary', 'md')}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirmImport()}
            disabled={importing || changeCount === 0}
            className={buttonClasses('primary', 'md')}
          >
            {importing ? 'Saving…' : 'Confirm import'}
          </button>
        </div>
      </div>
    </div>
  )
}
