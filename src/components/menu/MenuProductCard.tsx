import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { Flame, Plus } from 'lucide-react'
import { useCart } from '@/context/cartContext'
import { defaultStrength, defaultSugar, strengthOptions, sugarOptions } from '@/data/menu'
import { orderSettings } from '@/data/site'
import { formatPKR } from '@/lib/format'
import { buttonClasses } from '@/lib/buttonStyles'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import type { Product, SugarLevel, TeaStrength } from '@/types'

type MenuProductCardProps = {
  product: Product
}

export function MenuProductCard({ product }: MenuProductCardProps) {
  const { addItem } = useCart()
  const [sugar, setSugar] = useState<SugarLevel>(defaultSugar)
  const [strength, setStrength] = useState<TeaStrength>(defaultStrength)
  const [quantity, setQuantity] = useState(1)
  const sugarGroupName = useId()
  const strengthGroupName = useId()
  const lineTotal = product.price * quantity

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!product.isAvailable) return
    addItem(product, sugar, strength, quantity)
    setQuantity(1)
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-cream-300/80 bg-cream-50 shadow-card">
      <div className="relative m-2.5 overflow-hidden rounded-[20px] bg-cream-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          width={1000}
          height={750}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
          style={{ objectPosition: product.imagePosition ?? 'center' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-forest-950/30 via-transparent to-transparent"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-forest-900/80 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-cream-50 backdrop-blur">
            {product.badge}
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-cream-50/95 px-3.5 py-1.5 text-[13px] font-semibold text-forest-900 shadow-sm">
          {formatPKR(product.price)}
        </span>
        {!product.isAvailable && (
          <span className="absolute inset-0 grid place-items-center bg-forest-950/55 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-50">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <h2 className="font-display text-[28px] leading-tight tracking-[-0.01em] text-forest-900">
          {product.name}
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-forest-900/70">
          {product.description}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-1 flex-col gap-4">
          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tea-500">
              Sugar
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {sugarOptions.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name={sugarGroupName}
                    value={option.value}
                    checked={sugar === option.value}
                    onChange={() => setSugar(option.value)}
                    className="peer sr-only"
                    disabled={!product.isAvailable}
                  />
                  <span className="flex h-9 items-center justify-center rounded-xl border border-cream-300 bg-cream-100/60 px-2 text-[11.5px] font-medium text-forest-900/70 transition peer-checked:border-forest-800 peer-checked:bg-forest-800 peer-checked:text-cream-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500 peer-disabled:opacity-50">
                    {option.label.replace(' Sugar', '')}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tea-500">
              Strength
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {strengthOptions.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name={strengthGroupName}
                    value={option.value}
                    checked={strength === option.value}
                    onChange={() => setStrength(option.value)}
                    className="peer sr-only"
                    disabled={!product.isAvailable}
                  />
                  <span className="flex h-9 items-center justify-center rounded-xl border border-cream-300 bg-cream-100/60 px-2 text-[11.5px] font-medium text-forest-900/70 transition peer-checked:border-forest-800 peer-checked:bg-forest-800 peer-checked:text-cream-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500 peer-disabled:opacity-50">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-auto flex flex-wrap items-center gap-2.5 border-t border-cream-300/70 pt-4">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              label={`${product.name} quantity`}
              max={orderSettings.maxQuantityPerLine}
            />
            <button
              type="submit"
              disabled={!product.isAvailable}
              className={buttonClasses('primary', 'md', 'min-w-0 flex-1')}
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              <span className="truncate">
                {product.isAvailable ? `Add · ${formatPKR(lineTotal)}` : 'Unavailable'}
              </span>
            </button>
          </div>
        </form>

        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-forest-900/70">
          <Flame className="h-3 w-3 text-tea-500" aria-hidden="true" />
          Brewed fresh for every order.
        </p>
      </div>
    </article>
  )
}
