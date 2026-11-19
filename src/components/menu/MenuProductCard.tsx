import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
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
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-cream-300 bg-cream-50">
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          width={1000}
          height={750}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
          style={{ objectPosition: product.imagePosition ?? 'center' }}
        />
        {!product.isAvailable && (
          <span className="absolute inset-0 grid place-items-center bg-forest-950/55 text-[13px] font-semibold text-cream-50">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[20px] leading-tight text-forest-900">{product.name}</h2>
          <p className="shrink-0 text-[16px] font-bold tabular-nums text-forest-900">
            {formatPKR(product.price)}
          </p>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-forest-900/70">
          {product.description}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col gap-3.5">
          <fieldset>
            <legend className="text-[13px] font-medium text-forest-900/75">Sugar</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
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
                  <span className="flex min-h-11 items-center justify-center rounded-[10px] border border-cream-300 bg-cream-100/70 px-2 text-[12.5px] transition peer-checked:border-forest-800 peer-checked:bg-forest-800 peer-checked:text-cream-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500 peer-disabled:opacity-50">
                    {option.label.replace(' Sugar', '')}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[13px] font-medium text-forest-900/75">Strength</legend>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
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
                  <span className="flex min-h-11 items-center justify-center rounded-[10px] border border-cream-300 bg-cream-100/70 px-2 text-[12.5px] transition peer-checked:border-forest-800 peer-checked:bg-forest-800 peer-checked:text-cream-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500 peer-disabled:opacity-50">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-cream-300/80 pt-3">
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
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="truncate">
                {product.isAvailable ? `Add · ${formatPKR(lineTotal)}` : 'Unavailable'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </article>
  )
}
