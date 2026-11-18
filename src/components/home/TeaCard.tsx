import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPKR } from '@/lib/format'
import type { Product } from '@/types'

type TeaCardProps = {
  product: Product
}

export function TeaCard({ product }: TeaCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-cream-300/80 bg-cream-50 p-2.5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative overflow-hidden rounded-[20px] bg-cream-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          width={1000}
          height={1333}
          className="aspect-[4/5] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
          style={{ objectPosition: product.imagePosition ?? 'center' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-forest-950/25 via-transparent to-transparent"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-forest-900/80 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-cream-50 backdrop-blur">
            {product.badge}
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-cream-50/95 px-3.5 py-1.5 text-[13px] font-semibold text-forest-900 shadow-sm">
          {formatPKR(product.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-5 sm:px-4 sm:pb-4">
        <h3 className="font-display text-[26px] leading-tight tracking-[-0.01em] text-forest-900">
          {product.name}
        </h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-forest-900/70">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-cream-300/70 pt-4">
          <span className="text-[10px] uppercase tracking-[0.16em] text-tea-500">
            Sugar &amp; strength
          </span>
          {product.isAvailable ? (
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-forest-800 transition hover:text-forest-600"
            >
              Customize &amp; order
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : (
            <span className="text-[13px] font-medium text-forest-900/40">
              Currently unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
