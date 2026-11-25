import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { useCart } from '@/context/cartContext'
import {
  categoryForProduct,
  defaultStrength,
  defaultSugar,
  strengthOptions,
  sugarOptions,
  supportsTeaOptions,
} from '@/data/menu'
import { orderSettings } from '@/data/site'
import { formatPKR } from '@/lib/format'
import { buttonClasses } from '@/lib/buttonStyles'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { ProductImage } from '@/components/ui/ProductImage'
import type { Product, SugarLevel, TeaStrength } from '@/types'

type MenuProductCardProps = {
  product: Product
}

const optionChipClass =
  'flex min-h-11 items-center justify-center rounded-full border border-brand-brown/10 bg-cream/80 px-2 text-[12.5px] font-medium text-brand-brown/70 transition duration-200 ease-smooth peer-checked:border-brand-red peer-checked:bg-brand-red peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-red peer-disabled:opacity-50'

export function MenuProductCard({ product }: MenuProductCardProps) {
  const { addItem } = useCart()
  const [sugar, setSugar] = useState<SugarLevel>(defaultSugar)
  const [strength, setStrength] = useState<TeaStrength>(defaultStrength)
  const [quantity, setQuantity] = useState(1)
  const sugarGroupName = useId()
  const strengthGroupName = useId()
  const category = categoryForProduct(product)
  const customizable = supportsTeaOptions(category)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!product.isAvailable) return
    addItem(product, sugar, strength, quantity)
    setQuantity(1)
  }

  return (
    <article className="group flex h-full flex-col rounded-card bg-off-white p-2 shadow-card">
      <div className="relative overflow-hidden rounded-[0.95rem] bg-cream">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          width={1000}
          height={750}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition duration-500 ease-smooth group-hover:scale-[1.02]"
          style={{ objectPosition: product.imagePosition ?? 'center' }}
        />
        {product.badge && product.isAvailable && (
          <span className="absolute left-3 top-3 rounded-full bg-off-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-brown/70 backdrop-blur-sm">
            {product.badge}
          </span>
        )}
        {!product.isAvailable && (
          <span className="absolute inset-0 grid place-items-center bg-brand-maroon/60 text-[13px] font-semibold text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4 sm:px-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[20px] font-semibold leading-tight text-brand-brown">
            {product.name}
          </h2>
          <p className="shrink-0 text-[15px] font-semibold tabular-nums text-brand-brown">
            {formatPKR(product.price)}
          </p>
        </div>
        {product.description && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-brand-brown/60">
            {product.description}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col gap-3.5">
          {customizable && (
            <>
              <fieldset>
                <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-brown/45">
                  Sugar
                </legend>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
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
                      <span className={optionChipClass}>
                        {option.label.replace(' Sugar', '')}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-brown/45">
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
                      <span className={optionChipClass}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
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
              <span className="truncate">{product.isAvailable ? 'Add' : 'Unavailable'}</span>
            </button>
          </div>
        </form>
      </div>
    </article>
  )
}
