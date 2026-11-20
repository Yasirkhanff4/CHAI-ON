/**
 * Product image helpers.
 *
 * The storefront accepts three kinds of product image and nothing else:
 *   - a file in the app, e.g. /images/doodh-patti.jpg
 *   - an https url, e.g. https://…/tea.jpg
 *   - an uploaded, already-compressed data url (webp, jpeg or png)
 *
 * Uploads stay in the product document itself, so they are compressed in the
 * browser until they are small enough for Firestore and then stored as base64.
 * No Firebase Storage, no server, no third-party service.
 */

/** The largest file the admin may pick from disk. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
/** The size a compressed upload aims for. */
export const TARGET_IMAGE_BYTES = 100 * 1024
/** Anything above this is refused instead of being saved. */
export const MAX_STORED_IMAGE_BYTES = 150 * 1024
/** Longest side of a compressed upload, in pixels. */
export const PRODUCT_IMAGE_MAX_SIDE = 640
/** Used when a product has no usable image. */
export const FALLBACK_IMAGE = '/images/doodh-patti.jpg'

export const ALLOWED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** The only data urls that may ever reach an <img src>. */
export const ALLOWED_DATA_IMAGE_PREFIXES = [
  'data:image/webp;base64,',
  'data:image/jpeg;base64,',
  'data:image/png;base64,',
] as const

export type CompressedImage = {
  dataUrl: string
  bytes: number
  width: number
  height: number
}

/** True for an /images/… path, an https url or an allowed image data url. */
export function isAllowedImageSrc(src: string | null | undefined): boolean {
  const value = (src ?? '').trim()
  if (!value) return false
  if (value.startsWith('/images/')) return true
  if (value.startsWith('https://')) return true
  return ALLOWED_DATA_IMAGE_PREFIXES.some((prefix) => value.startsWith(prefix))
}

/**
 * Everything rendered as a product image goes through here, so a stray
 * javascript: or svg data url can never be displayed.
 */
export function safeImageSrc(src: string | null | undefined, fallback = FALLBACK_IMAGE): string {
  const value = (src ?? '').trim()
  return isAllowedImageSrc(value) ? value : fallback
}

export function formatImageSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** Byte size of a base64 data url, without the header. */
export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',')
  if (comma === -1) return 0
  const base64 = dataUrl.slice(comma + 1)
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding)
}

type DecodedImage = {
  image: ImageBitmap | HTMLImageElement
  width: number
  height: number
  release: () => void
}

function decodeWithImageElement(file: File): Promise<DecodedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      resolve({
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        release: () => URL.revokeObjectURL(url),
      })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image.'))
    }
    image.src = url
  })
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      return {
        image: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      }
    } catch {
      // Fall through to <img>, which also handles a few odd camera files.
    }
  }
  return decodeWithImageElement(file)
}

/** Draws the image into a canvas whose longest side is at most `maxSide`. */
function drawToCanvas(
  source: DecodedImage,
  maxSide: number,
  background: string | null,
): HTMLCanvasElement {
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))

  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot prepare images for upload.')

  if (background) {
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(source.image, 0, 0, canvas.width, canvas.height)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('This image could not be compressed. Try another file.'))
      },
      type,
      quality,
    )
  })
}

let webpSupport: boolean | null = null

function canvasSupportsWebp(): boolean {
  if (webpSupport !== null) return webpSupport
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  return webpSupport
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('This image could not be prepared for saving.'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Compresses a picked file to a data url that fits in Firestore.
 *
 * 640px on the longest side at quality 0.75 first, then lower quality, then
 * 480px. WebP is used when the browser supports it, JPEG otherwise.
 * Anything that cannot reach 150 KB is refused.
 */
export async function compressProductImage(file: File): Promise<CompressedImage> {
  if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(file.type)) {
    throw new Error('Choose a JPEG, PNG or WebP image.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `That file is ${formatImageSize(file.size)}. Choose an image under 8 MB.`,
    )
  }

  const source = await decodeImage(file)
  const mimeType = canvasSupportsWebp() ? 'image/webp' : 'image/jpeg'
  const background = mimeType === 'image/jpeg' ? '#ffffff' : null

  const attempts = [
    { maxSide: PRODUCT_IMAGE_MAX_SIDE, quality: 0.75 },
    { maxSide: PRODUCT_IMAGE_MAX_SIDE, quality: 0.65 },
    { maxSide: PRODUCT_IMAGE_MAX_SIDE, quality: 0.55 },
    { maxSide: PRODUCT_IMAGE_MAX_SIDE, quality: 0.45 },
    { maxSide: 480, quality: 0.55 },
    { maxSide: 480, quality: 0.45 },
  ]

  let best: { blob: Blob; width: number; height: number } | null = null

  try {
    for (const attempt of attempts) {
      const canvas = drawToCanvas(source, attempt.maxSide, background)
      const blob = await canvasToBlob(canvas, mimeType, attempt.quality)
      if (!best || blob.size < best.blob.size) {
        best = { blob, width: canvas.width, height: canvas.height }
      }
      if (blob.size <= TARGET_IMAGE_BYTES) break
    }
  } finally {
    source.release()
  }

  if (!best || best.blob.size > MAX_STORED_IMAGE_BYTES) {
    throw new Error(
      'This image stays over 150 KB after compression. Try a simpler or smaller picture.',
    )
  }

  const dataUrl = await blobToDataUrl(best.blob)
  if (!isAllowedImageSrc(dataUrl)) {
    throw new Error('This image type is not supported. Choose a JPEG, PNG or WebP photo.')
  }

  return { dataUrl, bytes: best.blob.size, width: best.width, height: best.height }
}
