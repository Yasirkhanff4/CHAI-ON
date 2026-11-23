import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, ClipboardList, Pencil, Plus, Upload, X } from 'lucide-react'
import { MenuImportDialog } from '@/components/admin/MenuImportDialog'
import { Container } from '@/components/ui/Container'
import { FormField } from '@/components/ui/FormField'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { formatPKR } from '@/lib/format'
import {
  ALLOWED_UPLOAD_TYPES,
  compressProductImage,
  dataUrlBytes,
  isAllowedImageSrc,
  safeImageSrc,
} from '@/lib/productImage'
import { fetchAllProducts } from '@/services/catalog'
import type { ProductInput } from '@/services/catalog'
import { saveProduct, updateProductAvailability } from '@/services/admin'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { Product } from '@/types'

type UploadedImage = {
  dataUrl: string
  bytes: number
}

type EditorState = {
  productId: string | null
  name: string
  description: string
  price: string
  imageUrl: string
  uploadedImage: UploadedImage | null
  badge: string
  sortOrder: string
  isAvailable: boolean
  isActive: boolean
}

const emptyEditor: EditorState = {
  productId: null,
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  uploadedImage: null,
  badge: '',
  sortOrder: '10',
  isAvailable: true,
  isActive: true,
}

function editorFromProduct(product: Product): EditorState {
  // An image that was uploaded before lives in the document as a data url.
  // Keep it in the preview instead of dumping base64 into the path field.
  const uploaded = product.imageUrl.startsWith('data:')
    ? { dataUrl: product.imageUrl, bytes: dataUrlBytes(product.imageUrl) }
    : null

  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    price: String(product.price),
    imageUrl: uploaded ? '' : product.imageUrl,
    uploadedImage: uploaded,
    badge: product.badge ?? '',
    sortOrder: String(product.sortOrder ?? 10),
    isAvailable: product.isAvailable,
    isActive: product.isActive ?? true,
  }
}

export function AdminProductsPage() {
  useDocumentTitle('Products | CHAYON Admin')
  const { profile } = useAuth()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [imageBusy, setImageBusy] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const result = await fetchAllProducts()
      setProducts(result)
      setError(null)
    } catch (loadError) {
      setError(describeFirebaseError(loadError, 'Products could not be loaded.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = async (product: Product, patch: { isAvailable?: boolean; isActive?: boolean }) => {
    setBusyId(product.id)
    setError(null)

    try {
      await updateProductAvailability(product.id, patch)
      setProducts((current) =>
        current.map((entry) => (entry.id === product.id ? { ...entry, ...patch } : entry)),
      )
    } catch (toggleError) {
      setError(describeFirebaseError(toggleError, 'The product could not be updated.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return

    setImageError(null)
    setImageBusy(true)

    try {
      const compressed = await compressProductImage(file)
      setEditor((current) =>
        current
          ? {
              ...current,
              uploadedImage: { dataUrl: compressed.dataUrl, bytes: compressed.bytes },
            }
          : current,
      )
    } catch (uploadError) {
      setImageError(
        uploadError instanceof Error
          ? uploadError.message
          : 'That image could not be prepared. Try another file.',
      )
    } finally {
      setImageBusy(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editor || saving) return

    const price = Number(editor.price)
    if (editor.name.trim().length < 2) {
      setError('Enter a product name.')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid price in PKR.')
      return
    }

    const typedImage = editor.imageUrl.trim()
    if (!typedImage && !editor.uploadedImage) {
      setError('Add an image: upload one from your computer, or enter an image path or URL.')
      return
    }
    if (typedImage && !editor.uploadedImage && !isAllowedImageSrc(typedImage)) {
      setError('Use an /images/… path or an https:// image URL, or upload an image instead.')
      return
    }

    const input: ProductInput = {
      name: editor.name.trim(),
      description: editor.description.trim(),
      price: Math.round(price),
      imageUrl: editor.uploadedImage?.dataUrl ?? typedImage,
      badge: editor.badge.trim(),
      isAvailable: editor.isAvailable,
      isActive: editor.isActive,
      sortOrder: Number(editor.sortOrder) || 10,
    }

    setSaving(true)
    setError(null)

    try {
      const savedId = await saveProduct(editor.productId, input)
      setNotice(editor.productId ? 'Product updated.' : 'Product added.')
      setEditor({ ...editor, productId: savedId })
      await load()
    } catch (saveError) {
      setError(describeFirebaseError(saveError, 'The product could not be saved.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[30px] leading-tight text-brand-brown">Products</h1>
          <p className="mt-1 text-[13px] text-brand-brown/65">
            Prices here are the prices customers pay. Checkout reads them again when an order is
            placed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setImportOpen(true)
              setNotice(null)
            }}
            className={buttonClasses('secondary', 'md')}
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Load CHAYON menu
          </button>
          <button
            type="button"
            onClick={() => {
              setEditor(emptyEditor)
              setNotice(null)
              setImageError(null)
            }}
            className={buttonClasses('primary', 'md')}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-brand-red/30 bg-soft-pink/30 px-4 py-3 text-[13px] text-brand-red"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-soft-pink bg-cream px-4 py-3 text-[13px] text-brand-red"
        >
          {notice}
        </p>
      )}

      {editor && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-5 rounded-xl border border-brand-brown/15 bg-off-white p-5 shadow-card sm:p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[22px] leading-tight text-brand-brown">
              {editor.productId ? 'Edit product' : 'New product'}
            </h2>
            <button
              type="button"
              onClick={() => setEditor(null)}
              aria-label="Close product editor"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-brand-brown/60 hover:bg-soft-pink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField
              id="productName"
              label="Name"
              value={editor.name}
              onChange={(value) => setEditor({ ...editor, name: value })}
              required
              maxLength={80}
              disabled={saving}
            />
            <FormField
              id="productPrice"
              label="Price (PKR)"
              type="number"
              inputMode="numeric"
              value={editor.price}
              onChange={(value) => setEditor({ ...editor, price: value })}
              required
              disabled={saving}
            />
            <FormField
              id="productDescription"
              label="Description"
              value={editor.description}
              onChange={(value) => setEditor({ ...editor, description: value })}
              multiline
              rows={3}
              maxLength={280}
              className="sm:col-span-2"
              disabled={saving}
            />

            <div className="rounded-xl border border-soft-pink bg-cream/60 p-3.5 sm:col-span-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={saving || imageBusy}
                  className={buttonClasses('secondary', 'sm')}
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  {imageBusy ? 'Preparing image…' : 'Choose image from computer'}
                </button>
                <span className="text-[11.5px] text-brand-brown/60">
                  JPEG, PNG or WebP · up to 8 MB. It is scaled to 640px and saved with the product.
                </span>
              </div>

              <input
                ref={fileInput}
                id="productImageFile"
                type="file"
                accept={ALLOWED_UPLOAD_TYPES.join(',')}
                onChange={(event) => void handleImageFile(event.target.files?.[0])}
                disabled={saving || imageBusy}
                aria-label="Choose image from computer"
                aria-describedby={imageError ? 'productImageFile-error' : undefined}
                className="sr-only"
              />

              {imageError && (
                <p
                  id="productImageFile-error"
                  role="alert"
                  className="mt-2 text-[12.5px] font-medium leading-relaxed text-brand-red"
                >
                  {imageError}
                </p>
              )}

              {editor.uploadedImage && (
                <div className="mt-3 flex flex-wrap items-start gap-3">
                  <img
                    src={safeImageSrc(editor.uploadedImage.dataUrl)}
                    alt="Preview of the chosen product image"
                    width={640}
                    height={480}
                    decoding="async"
                    className="aspect-[4/3] h-24 w-32 rounded-lg border border-soft-pink/80 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-brand-brown">
                      Uploaded image · {Math.max(1, Math.round(editor.uploadedImage.bytes / 1024))}{' '}
                      KB
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-brand-brown/60">
                      Saved inside the product, so no image hosting is needed.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditor({ ...editor, uploadedImage: null })
                        setImageError(null)
                      }}
                      disabled={saving || imageBusy}
                      className="mt-1.5 inline-flex min-h-9 items-center gap-1 text-[12.5px] font-semibold text-brand-red hover:text-brand-red"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <FormField
              id="productImageUrl"
              label="Image path or URL"
              value={editor.imageUrl}
              onChange={(value) => setEditor({ ...editor, imageUrl: value })}
              required={!editor.uploadedImage}
              hint={
                editor.uploadedImage
                  ? 'Optional: an uploaded image is already attached and will be used.'
                  : 'e.g. /images/doodh-patti.jpg (add the file to public/images) or any https:// image URL.'
              }
              className="sm:col-span-2"
              disabled={saving}
            />
            <FormField
              id="productBadge"
              label="Badge"
              value={editor.badge}
              onChange={(value) => setEditor({ ...editor, badge: value })}
              maxLength={30}
              hint="Optional label, e.g. House classic."
              disabled={saving}
            />
            <FormField
              id="productSort"
              label="Menu order"
              type="number"
              inputMode="numeric"
              value={editor.sortOrder}
              onChange={(value) => setEditor({ ...editor, sortOrder: value })}
              hint="Lower numbers appear first."
              disabled={saving}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-brand-brown/75">
              <input
                type="checkbox"
                checked={editor.isAvailable}
                onChange={(event) => setEditor({ ...editor, isAvailable: event.target.checked })}
                className="h-4 w-4 rounded border-brand-brown/30"
                disabled={saving}
              />
              Available to order
            </label>
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-brand-brown/75">
              <input
                type="checkbox"
                checked={editor.isActive}
                onChange={(event) => setEditor({ ...editor, isActive: event.target.checked })}
                className="h-4 w-4 rounded border-brand-brown/30"
                disabled={saving}
              />
              Visible on the public menu
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={buttonClasses('primary', 'md', 'mt-5')}
          >
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </form>
      )}

      <div className="mt-5 rounded-xl border border-soft-pink/80 bg-off-white shadow-card">
        {loading && (
          <div className="px-5 py-12 text-center">
            <span
              aria-hidden="true"
              className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-brand-brown/15 border-t-brand-red"
            />
            <p className="mt-3 text-[13px] text-brand-brown/60">Loading products…</p>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-xl text-brand-brown">No products in Firestore yet</p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-brand-brown/65">
              The storefront is showing the built-in CHAYON menu. Load it into Firestore to start
              managing names, prices and availability here.
            </p>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className={buttonClasses('primary', 'md', 'mt-5')}
            >
              Load CHAYON menu
            </button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <ul className="divide-y divide-soft-pink/70">
            {products.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-5">
                <img
                  src={safeImageSrc(product.imageUrl)}
                  alt={product.name}
                  width={640}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] h-16 w-20 shrink-0 rounded-xl border border-soft-pink/70 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-brand-brown">{product.name}</p>
                  <p className="text-[11.5px] text-brand-brown/60">
                    {formatPKR(product.price)} · ID {product.id}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-brand-brown/55">
                    {product.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 rounded-full border border-soft-pink bg-cream/70 px-2.5 py-1.5 text-[11px] font-medium text-brand-brown/75">
                    <input
                      type="checkbox"
                      checked={product.isAvailable}
                      onChange={(event) =>
                        void toggle(product, { isAvailable: event.target.checked })
                      }
                      disabled={busyId === product.id}
                      className="h-3.5 w-3.5 rounded border-brand-brown/30"
                    />
                    Available
                  </label>
                  <label className="flex items-center gap-1.5 rounded-full border border-soft-pink bg-cream/70 px-2.5 py-1.5 text-[11px] font-medium text-brand-brown/75">
                    <input
                      type="checkbox"
                      checked={product.isActive ?? true}
                      onChange={(event) => void toggle(product, { isActive: event.target.checked })}
                      disabled={busyId === product.id}
                      className="h-3.5 w-3.5 rounded border-brand-brown/30"
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditor(editorFromProduct(product))
                      setNotice(null)
                      setImageError(null)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={buttonClasses('secondary', 'sm')}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-[11.5px] leading-relaxed text-brand-brown/50">
        Signed in as {profile?.name}. Only admins can change products; Firestore rules enforce it.
      </p>

      {importOpen && (
        <MenuImportDialog
          products={products}
          onClose={() => setImportOpen(false)}
          onImported={async () => {
            setNotice('CHAYON menu loaded. Existing products were not deleted.')
            await load()
          }}
        />
      )}
    </Container>
  )
}
