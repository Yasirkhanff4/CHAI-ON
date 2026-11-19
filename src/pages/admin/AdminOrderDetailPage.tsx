import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  MapPin,
  Phone,
  Truck,
  User,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/context/authContext'
import { useCatalog } from '@/context/catalogContext'
import { strengthLabel, sugarLabel } from '@/data/menu'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { formatDateTime, formatPKR } from '@/lib/format'
import { DELIVERY_STAFF_STATUSES, nextStatuses } from '@/lib/orderFlow'
import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import { assignDelivery, fetchDeliveryStaff, markOrderPaid, updateOrderStatus } from '@/services/admin'
import type { StaffMember } from '@/services/admin'
import { fetchOrderByNumber } from '@/services/orders'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { Order } from '@/types/order'
import type { OrderStatus } from '@/types'

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  ACCEPTED: 'Accept order',
  REJECTED: 'Reject order',
  PREPARING: 'Start preparing',
  READY: 'Mark ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Mark delivered',
  CANCELLED: 'Cancel order',
  DELIVERY_FAILED: 'Delivery failed',
}

export function AdminOrderDetailPage() {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>()
  const { profile, isAdmin } = useAuth()
  const { products } = useCatalog()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [staff, setStaff] = useState<StaffMember[]>([])

  useDocumentTitle(order ? `Order ${order.orderNumber} — CHAI ON Admin` : 'Order — CHAI ON Admin')

  const loadOrder = async () => {
    try {
      const found = await fetchOrderByNumber(orderNumber)
      setOrder(found)
      setError(found ? null : 'That order does not exist.')
    } catch (loadError) {
      setError(describeFirebaseError(loadError, 'This order could not be loaded.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    fetchOrderByNumber(orderNumber)
      .then((found) => {
        if (cancelled) return
        setOrder(found)
        setError(found ? null : 'That order does not exist.')
        setLoading(false)
      })
      .catch((loadError: unknown) => {
        if (cancelled) return
        setError(describeFirebaseError(loadError, 'This order could not be loaded.'))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [orderNumber])

  useEffect(() => {
    if (!isAdmin) return

    let cancelled = false
    fetchDeliveryStaff()
      .then((result) => {
        if (!cancelled) setStaff(result)
      })
      .catch(() => {
        // The assign control simply stays unavailable if staff cannot be read.
      })

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const handleStatus = async (next: OrderStatus) => {
    if (!order || !profile || busy) return

    setBusy(true)
    setActionError(null)

    try {
      await updateOrderStatus(order.orderNumber, order.orderStatus, next, profile.name || profile.uid)
      await loadOrder()
    } catch (statusError) {
      setActionError(describeFirebaseError(statusError, 'The status could not be updated.'))
    } finally {
      setBusy(false)
    }
  }

  const handleAssign = async (uid: string) => {
    if (!order || busy) return

    const member = staff.find((entry) => entry.uid === uid) ?? null
    setBusy(true)
    setActionError(null)

    try {
      await assignDelivery(order.orderNumber, member)
      await loadOrder()
    } catch (assignError) {
      setActionError(describeFirebaseError(assignError, 'Delivery could not be assigned.'))
    } finally {
      setBusy(false)
    }
  }

  const handlePaid = async () => {
    if (!order || busy) return
    setBusy(true)
    setActionError(null)

    try {
      await markOrderPaid(order.orderNumber)
      await loadOrder()
    } catch (paidError) {
      setActionError(describeFirebaseError(paidError, 'Payment could not be confirmed.'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="rounded-[24px] border border-cream-300/80 bg-cream-50 px-5 py-12 text-center shadow-card">
          <span
            aria-hidden="true"
            className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-forest-900/15 border-t-forest-800"
          />
          <p className="mt-3 text-[13px] text-forest-900/60">Loading order…</p>
        </div>
      </Container>
    )
  }

  if (!order) {
    return (
      <Container>
        <div className="rounded-[24px] border border-cream-300/80 bg-cream-50 px-5 py-12 text-center shadow-card">
          <AlertCircle className="mx-auto h-6 w-6 text-red-600" aria-hidden="true" />
          <p className="mt-3 font-display text-xl text-forest-900">Order unavailable</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-forest-900/65">
            {error ?? 'You do not have access to this order.'}
          </p>
          <Link to="/admin/orders" className={buttonClasses('secondary', 'md', 'mt-5')}>
            Back to orders
          </Link>
        </div>
      </Container>
    )
  }

  const availableTransitions = nextStatuses(order.orderStatus).filter(
    (status) => isAdmin || DELIVERY_STAFF_STATUSES.includes(status),
  )

  // Prices can change after an order is placed. Re-add the items at today's
  // catalog prices (falling back to the price that was charged) and warn when
  // the stored total no longer matches — never block the owner.
  const currentTotal = order.items.reduce((sum, line) => {
    const product = products.find((entry) => entry.id === line.productId)
    return sum + (product ? product.price : line.unitPrice) * line.quantity
  }, order.deliveryCharge)
  const totalMismatch = products.length > 0 && currentTotal !== order.total

  return (
    <Container>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-forest-900/60 hover:text-forest-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[30px] leading-tight text-forest-900">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-[12.5px] text-forest-900/60">
            Placed {formatDateTime(order.createdAt)} · updated {formatDateTime(order.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {totalMismatch && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-50 px-2.5 py-1 text-[10.5px] font-semibold text-red-800">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Total mismatch, check before delivery
            </span>
          )}
          <StatusBadge status={order.orderStatus} />
          <span className="rounded-full border border-cream-300 bg-cream-50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-forest-900/60">
            {order.paymentStatus === 'PAID' ? 'Paid' : 'COD unpaid'}
          </span>
        </div>
      </div>

      {actionError && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3 text-[13px] text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {actionError}
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-cream-300/80 bg-cream-50 p-5 shadow-card">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tea-500">
              Items
            </h2>
            <table className="mt-3 w-full text-left">
              <thead className="text-[10px] uppercase tracking-[0.12em] text-forest-900/50">
                <tr>
                  <th scope="col" className="pb-2 font-semibold">
                    Tea
                  </th>
                  <th scope="col" className="pb-2 text-center font-semibold">
                    Qty
                  </th>
                  <th scope="col" className="pb-2 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/60">
                {order.items.map((item) => (
                  <tr key={`${item.productId}-${item.sugar}-${item.strength}`}>
                    <td className="py-2.5">
                      <p className="text-[13.5px] font-medium text-forest-900">{item.name}</p>
                      <p className="text-[11.5px] text-forest-900/60">
                        {sugarLabel(item.sugar)} · {strengthLabel(item.strength)} ·{' '}
                        {formatPKR(item.unitPrice)} each
                      </p>
                    </td>
                    <td className="py-2.5 text-center text-[13px] tabular-nums text-forest-900/75">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 text-right text-[13px] font-semibold tabular-nums text-forest-900">
                      {formatPKR(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="mt-3 space-y-2 border-t border-cream-300/70 pt-3 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-forest-900/70">Subtotal</dt>
                <dd className="tabular-nums text-forest-900">{formatPKR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-forest-900/70">Delivery</dt>
                <dd className="tabular-nums text-forest-900">
                  {order.deliveryCharge === 0 ? 'Free' : formatPKR(order.deliveryCharge)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-cream-300/70 pt-2">
                <dt className="font-semibold text-forest-900">Total</dt>
                <dd className="font-display text-[24px] leading-none text-forest-900">
                  {formatPKR(order.total)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[24px] border border-cream-300/80 bg-cream-50 p-5 shadow-card">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tea-500">
              Progress
            </h2>
            <div className="mt-4">
              <OrderTimeline
                status={order.orderStatus}
                history={order.statusHistory}
                createdAt={order.createdAt}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[24px] border border-cream-300/80 bg-cream-50 p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-tea-500">
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              Customer
            </h2>
            <p className="mt-2 text-[14px] font-semibold text-forest-900">{order.customerName}</p>
            <a
              href={`tel:${order.phone}`}
              className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-forest-800 hover:text-forest-600"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {order.phone}
            </a>
            <p className="mt-3 flex items-start gap-1.5 text-[13px] leading-relaxed text-forest-900/75">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tea-500" aria-hidden="true" />
              <span>
                {order.officeOrShop}, {order.floor}
                <br />
                {order.building}
              </span>
            </p>
            {order.deliveryInstructions && (
              <p className="mt-2 rounded-xl bg-cream-100 px-3 py-2 text-[12.5px] leading-relaxed text-forest-900/70">
                {order.deliveryInstructions}
              </p>
            )}
            <p className="mt-3 flex items-center gap-1.5 border-t border-cream-300/70 pt-3 text-[12px] text-forest-900/60">
              <Banknote className="h-3.5 w-3.5 text-tea-500" aria-hidden="true" />
              Cash on delivery
            </p>
          </div>

          <div className="rounded-[24px] border border-cream-300/80 bg-cream-50 p-5 shadow-card">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tea-500">
              Actions
            </h2>

            {availableTransitions.length === 0 && (
              <p className="mt-2 text-[12.5px] leading-relaxed text-forest-900/60">
                This order is {ORDER_STATUS_LABELS[order.orderStatus].toLowerCase()} and cannot
                change further.
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {availableTransitions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatus(status)}
                  disabled={busy}
                  className={buttonClasses(
                    status === 'REJECTED' || status === 'CANCELLED' || status === 'DELIVERY_FAILED'
                      ? 'secondary'
                      : 'primary',
                    'sm',
                  )}
                >
                  {ACTION_LABELS[status] ?? ORDER_STATUS_LABELS[status]}
                </button>
              ))}
            </div>

            {isAdmin && order.paymentStatus === 'UNPAID' && (
              <button
                type="button"
                onClick={handlePaid}
                disabled={busy}
                className={buttonClasses('secondary', 'sm', 'mt-3 w-full')}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Confirm cash received
              </button>
            )}

            {isAdmin && (
              <div className="mt-5 border-t border-cream-300/70 pt-4">
                <label
                  htmlFor="assign-staff"
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-tea-500"
                >
                  <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                  Delivery staff
                </label>
                <select
                  id="assign-staff"
                  value={order.assignedTo ?? ''}
                  onChange={(event) => handleAssign(event.target.value)}
                  disabled={busy}
                  className="mt-2 h-10 w-full rounded-xl border border-forest-900/15 bg-cream-50 px-3 text-[13px] text-forest-900 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                >
                  <option value="">Unassigned</option>
                  {staff.map((member) => (
                    <option key={member.uid} value={member.uid}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {staff.length === 0 && (
                  <p className="mt-2 text-[11.5px] leading-relaxed text-forest-900/55">
                    No delivery staff accounts yet. You can still update delivery status yourself.
                  </p>
                )}
                {order.assignedToName && (
                  <p className="mt-2 text-[11.5px] text-forest-900/60">
                    Assigned to {order.assignedToName}
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </Container>
  )
}
