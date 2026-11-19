import { Trash2 } from 'lucide-react'
import { useCart } from '@/context/cartContext'
import { orderSettings } from '@/data/site'
import { strengthLabel, sugarLabel } from '@/data/menu'
import { formatPKR } from '@/lib/format'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import type { CartItem } from '@/types'

type CartLineItemProps = {
  item: CartItem
}

export function CartLineItem({ item }: CartLineItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const lineTotal = item.unitPrice * item.quantity

  return (
    <li className="flex gap-3 py-4 sm:gap-4">
      <img
        src={item.imageUrl}
        alt={item.name}
        width={200}
        height={250}
        loading="lazy"
        className="h-20 w-16 shrink-0 rounded-lg border border-cream-300 object-cover sm:h-24 sm:w-20"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold leading-tight text-forest-900">
              {item.name}
            </h3>
            <p className="mt-1 text-[12.5px] text-forest-900/70">
              {sugarLabel(item.sugar)} · {strengthLabel(item.strength)}
            </p>
            <p className="mt-0.5 text-[12px] text-forest-900/70">
              {formatPKR(item.unitPrice)} each
            </p>
          </div>
          <p className="shrink-0 text-[15px] font-bold tabular-nums text-forest-900">
            {formatPKR(lineTotal)}
          </p>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            value={item.quantity}
            onChange={(next) => updateQuantity(item.id, next)}
            label={`${item.name} quantity`}
            max={orderSettings.maxQuantityPerLine}
            size="sm"
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="inline-flex min-h-9 items-center gap-1.5 px-1.5 text-[12.5px] font-medium text-forest-900/60 transition hover:text-forest-900"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}
