import { CheckCircle2, X } from 'lucide-react'
import { useCart } from '@/context/cartContext'

export function CartToast() {
  const { notice, dismissNotice } = useCart()

  if (!notice) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
    >
      <div
        key={notice.id}
        className="pointer-events-auto flex w-full max-w-sm animate-[toast-in_0.25s_ease-out] items-start gap-3 rounded-2xl border border-forest-800/10 bg-forest-900 px-4 py-3 text-cream-50 shadow-lift"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
        <p className="flex-1 text-[13px] leading-relaxed">{notice.message}</p>
        <button
          type="button"
          onClick={dismissNotice}
          aria-label="Dismiss notification"
          className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-cream-100/70 transition hover:bg-cream-50/10 hover:text-cream-50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
