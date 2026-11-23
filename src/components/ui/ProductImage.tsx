import { useState } from 'react'
import type { CSSProperties } from 'react'
import { FALLBACK_IMAGE, safeImageSrc } from '@/lib/productImage'

type ProductImageProps = {
  src?: string | null
  alt: string
  className?: string
  style?: CSSProperties
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
}

/**
 * Every product photo goes through here. A missing or broken image becomes the
 * cream cup placeholder instead of a broken image icon.
 */
export function ProductImage({
  src,
  alt,
  className = '',
  style,
  width,
  height,
  loading = 'lazy',
  fetchPriority,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false)
  const resolved = failed ? FALLBACK_IMAGE : safeImageSrc(src)

  return (
    <img
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
      style={style}
      onError={() => {
        if (!failed) setFailed(true)
      }}
    />
  )
}
