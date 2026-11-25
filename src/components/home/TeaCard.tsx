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
    <article className="group flex h-full flex-col rounded-card bg-off-white p-2 shadow-card transition duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift">
      <div className="relative overflow-hidden rounded-[0.95rem] bg-cream">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          width={1000}
          height={750}
          className="aspect-[4/3] w-full object-cover transition duration-500 ease-smooth group-hover:scale-[1.03]"
          style={{ objectPosition: product.imagePosition ?? 'center' }}
        />
        {product.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-off-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-brown/70 backdrop-blur-sm">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[18px] font-semibold leading-tight text-brand-brown">
            {product.name}
          </h3>
          <p className="shrink-0 text-[15px] font-semibold tabular-nums text-brand-brown">
            {formatPKR(product.price)}
          </p>
        </div>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-brand-brown/60">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-[11.5px] font-medium text-brand-brown/45">
            {customizable ? 'Sugar + strength' : category}
          </span>
          {product.isAvailable ? (
            <Link
              to="/menu"
              className="group/link inline-flex min-h-9 items-center gap-1 rounded-full text-[13px] font-semibold text-brand-red transition-colors hover:text-brand-maroon"
            >
              {customizable ? 'Customize' : 'Add to order'}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 ease-smooth group-hover/link:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <span className="text-[12.5px] text-brand-brown/50">Not available today</span>
          )}
        </div>
      </div>
    </article>
  )
}
