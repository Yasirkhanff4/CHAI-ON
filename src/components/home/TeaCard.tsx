import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPKR } from '@/lib/format'
import type { Product } from '@/types'

type TeaCardProps = {
  product: Product
}

export function TeaCard({ product }: TeaCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-cream-300 bg-cream-50">
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        width={1000}
        height={1333}
        className="aspect-[4/3] w-full object-cover"
        style={{ objectPosition: product.imagePosition ?? 'center' }}
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[19px] leading-tight text-forest-900">{product.name}</h3>
          <p className="shrink-0 text-[16px] font-bold tabular-nums text-forest-900">
            {formatPKR(product.price)}
          </p>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-forest-900/70">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-cream-300/80 pt-3">
          <span className="text-[12.5px] text-forest-900/60">Sugar and strength</span>
          {product.isAvailable ? (
            <Link
              to="/menu"
              className="inline-flex min-h-9 items-center gap-1 text-[13px] font-semibold text-forest-800 transition hover:text-forest-600"
            >
              Customize
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <span className="text-[13px] text-forest-900/50">Not available today</span>
          )}
        </div>
      </div>
    </article>
  )
}
