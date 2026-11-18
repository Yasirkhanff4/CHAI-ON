import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, ImagePlus, Loader2, Pencil, Plus, X } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { FormField } from '@/components/ui/FormField'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { formatPKR } from '@/lib/format'
import { slugifyProductId, fetchAllProducts, seedLaunchProducts } from '@/services/catalog'
import type { ProductInput } from '@/services/catalog'
import { saveProduct, updateProductAvailability, uploadProductImage } from '@/services/admin'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { Product } from '@/types'

type EditorState = {
  productId: string | null
  name: string
  description: string
  price: string
  imageUrl: string
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
  badge: '',
  sortOrder: '10',
  isAvailable: true,
  isActive: true,
}

function editorFromProduct(product: Product): EditorState {
  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    price: String(product.price),
    imageUrl: product.imageUrl,
    badge: product.badge ?? '',
    sortOrder: String(product.sortOrder ?? 10),
    isAvailable: product.isAvailable,
    isActive: product.isActive ?? true,
  }
}

export function AdminProductsPage() {
  useDocumentTitle('Products — CHAI ON Admin')
  const { profile } = useAuth()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

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

  const handleImage = async (file: File | null) => {
    if (!file || !editor) return

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file (JPG, PNG or WebP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Images must be smaller than 5 MB.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const pathId = editor.productId ?? slugifyProductId(editor.name)
      const url = await uploadProductImage(file, pathId)
      setEditor((current) => (current ? { ...current, imageUrl: url } : current))
    } catch (uploadError) {
      setError(describeFirebaseError(uploadError, 'The image could not be uploaded.'))
    } finally {
      setUploading(false)
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
    if (!editor.imageUrl.trim()) {
      setError('Add an image URL or upload a photo.')
      return
    }

    const input: ProductInput = {
      name: editor.name.trim(),
      description: editor.description.trim(),
      price: Math.round(price),
      imageUrl: editor.imageUrl.trim(),
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

  const seed = async () => {
    setBusyId('seed')
    setError(null)
    try {
      await seedLaunchProducts()
      setNotice('Launch teas added to Firestore.')
      await load()
    } catch (seedError) {
      setError(describeFirebaseError(seedError, 'The launch catalog could not be created.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[30px] leading-tight text-forest-900">Products</h1>
          <p className="mt-1 text-[13px] text-forest-900/65">
            Prices here are the prices customers pay. The order function reads them again when an
            order is placed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditor(emptyEditor)
            setNotice(null)
          }}
          className={buttonClasses('primary', 'md')}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add product
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3 text-[13px] text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-4 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-[13px] text-forest-800"
        >
          {notice}
        </p>
      )}

      {editor && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-5 rounded-[24px] border border-forest-900/15 bg-cream-50 p-5 shadow-card sm:p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[22px] leading-tight text-forest-900">
              {editor.productId ? 'Edit product' : 'New product'}
            </h2>
            <button
              type="button"
              onClick={() => setEditor(null)}
              aria-label="Close product editor"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-forest-900/60 hover:bg-cream-200"
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
            <FormField
              id="productImageUrl"
              label="Image URL"
              value={editor.imageUrl}
              onChange={(value) => setEditor({ ...editor, imageUrl: value })}
              required
              hint="Upload a photo below, or paste an HTTPS image URL."
              className="sm:col-span-2"
              disabled={saving || uploading}
            />
            <label className="sm:col-span-2">
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-forest-900/15 bg-cream-100/70 px-4 py-2.5 text-[12.5px] font-medium text-forest-900 transition hover:bg-cream-200/70">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    Upload product photo
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => void handleImage(event.target.files?.[0] ?? null)}
                  disabled={saving || uploading}
                />
              </span>
            </label>

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
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-forest-900/75">
              <input
                type="checkbox"
                checked={editor.isAvailable}
                onChange={(event) => setEditor({ ...editor, isAvailable: event.target.checked })}
                className="h-4 w-4 rounded border-forest-900/30"
                disabled={saving}
              />
              Available to order
            </label>
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-forest-900/75">
              <input
                type="checkbox"
                checked={editor.isActive}
                onChange={(event) => setEditor({ ...editor, isActive: event.target.checked })}
                className="h-4 w-4 rounded border-forest-900/30"
                disabled={saving}
              />
              Visible on the public menu
            </label>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className={buttonClasses('primary', 'md', 'mt-5')}
          >
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </form>
      )}

      <div className="mt-5 rounded-[24px] border border-cream-300/80 bg-cream-50 shadow-card">
        {loading && (
          <div className="px-5 py-12 text-center">
            <span
              aria-hidden="true"
              className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-forest-900/15 border-t-forest-800"
            />
            <p className="mt-3 text-[13px] text-forest-900/60">Loading products…</p>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-xl text-forest-900">No products in Firestore yet</p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-forest-900/65">
              The storefront is showing the built-in launch menu. Create the two teas in Firestore
              to start managing them here.
            </p>
            <button
              type="button"
              onClick={seed}
              disabled={busyId === 'seed'}
              className={buttonClasses('primary', 'md', 'mt-5')}
            >
              {busyId === 'seed' ? 'Adding…' : 'Add launch teas'}
            </button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <ul className="divide-y divide-cream-300/70">
            {products.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-5">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-16 w-20 shrink-0 rounded-xl border border-cream-300/70 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-forest-900">{product.name}</p>
                  <p className="text-[11.5px] text-forest-900/60">
                    {formatPKR(product.price)} · ID {product.id}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-forest-900/55">
                    {product.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-100/70 px-2.5 py-1.5 text-[11px] font-medium text-forest-900/75">
                    <input
                      type="checkbox"
                      checked={product.isAvailable}
                      onChange={(event) =>
                        void toggle(product, { isAvailable: event.target.checked })
                      }
                      disabled={busyId === product.id}
                      className="h-3.5 w-3.5 rounded border-forest-900/30"
                    />
                    Available
                  </label>
                  <label className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-100/70 px-2.5 py-1.5 text-[11px] font-medium text-forest-900/75">
                    <input
                      type="checkbox"
                      checked={product.isActive ?? true}
                      onChange={(event) => void toggle(product, { isActive: event.target.checked })}
                      disabled={busyId === product.id}
                      className="h-3.5 w-3.5 rounded border-forest-900/30"
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditor(editorFromProduct(product))
                      setNotice(null)
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

      <p className="mt-4 text-[11.5px] leading-relaxed text-forest-900/50">
        Signed in as {profile?.name}. Only admins can change products; Firestore rules enforce it.
      </p>
    </Container>
  )
}
