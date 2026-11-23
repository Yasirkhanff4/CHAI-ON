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
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-soft-pink bg-off-white shadow-card">
      <div className="relative">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          width={1000}
          height={750}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
          style={{ objectPosition: product.imagePosition ?? 'center' }}
        />
        {!product.isAvailable && (
          <span className="absolute inset-0 grid place-items-center bg-brand-maroon/60 text-[13px] font-semibold text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[20px] font-semibold leading-tight text-brand-brown">
            {product.name}
          </h2>
          <p className="shrink-0 text-[16px] font-bold tabular-nums text-brand-brown">
            {formatPKR(product.price)}
          </p>
        </div>
        {product.description && (
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-brand-brown/70">
            {product.description}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col gap-3.5">
          {customizable && (
            <>
              <fieldset>
                <legend className="text-[13px] font-medium text-brand-brown/80">Sugar</legend>
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
                      <span className="flex min-h-11 items-center justify-center rounded-xl border border-soft-pink bg-cream px-2 text-[12.5px] text-brand-brown transition peer-checked:border-brand-red peer-checked:bg-brand-red peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-red peer-disabled:opacity-50">
                        {option.label.replace(' Sugar', '')}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-[13px] font-medium text-brand-brown/80">Strength</legend>
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
                      <span className="flex min-h-11 items-center justify-center rounded-xl border border-soft-pink bg-cream px-2 text-[12.5px] text-brand-brown transition peer-checked:border-brand-red peer-checked:bg-brand-red peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-red peer-disabled:opacity-50">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-soft-pink pt-3">
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
                {product.isAvailable ? 'Add' : 'Unavailable'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </article>
  )
}
