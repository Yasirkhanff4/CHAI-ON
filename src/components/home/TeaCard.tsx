import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductImage } from '@/components/ui/ProductImage'
import {
  categoryForProduct,
  supportsTeaOptions,
} from '@/data/menu'
import { formatPKR } from '@/lib/format'
import type { Product } from '@/types'

type TeaCardProps = {
  product: Product
}

export function TeaCard({ product }: TeaCardProps) {
  const category = categoryForProduct(product)
  const customizable = supportsTeaOptions(category)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-soft-pink bg-off-white shadow-card">
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        width={1000}
        height={750}
        className="aspect-[4/3] w-full object-cover"
        style={{ objectPosition: product.imagePosition ?? 'center' }}
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[19px] font-semibold leading-tight text-brand-brown">
            {product.name}
          </h3>
          <p className="shrink-0 text-[16px] font-bold tabular-nums text-brand-brown">
            {formatPKR(product.price)}
          </p>
        </div>
        {product.description && (
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-brand-brown/70">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-soft-pink pt-3">
          <span className="text-[12.5px] text-brand-brown/65">
            {customizable ? 'Sugar and strength' : category}
          </span>
          {product.isAvailable ? (
            <Link
              to="/menu"
              className="inline-flex min-h-9 items-center gap-1 text-[13px] font-semibold text-brand-red transition hover:text-brand-maroon"
            >
              {customizable ? 'Customize' : 'Add to order'}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <span className="text-[13px] text-brand-brown/50">Not available today</span>
          )}
        </div>
      </div>
    </article>
  )
}
