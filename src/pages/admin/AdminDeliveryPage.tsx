import { useEffect, useState } from 'react'
import { AlertCircle, MapPin, Phone, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { formatDateTime, formatPKR } from '@/lib/format'
import { DELIVERY_STAFF_STATUSES, nextStatuses } from '@/lib/orderFlow'
import { assignDelivery, fetchDeliveryStaff, updateOrderStatus } from '@/services/admin'
import type { StaffMember } from '@/services/admin'
import { subscribeAdminOrders } from '@/services/admin'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { Order } from '@/types/order'
import type { OrderStatus } from '@/types'

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  DELIVERY_FAILED: 'Delivery failed',
}

export function AdminDeliveryPage() {
  useDocumentTitle('Delivery — CHAI ON Admin')
  const { profile, isAdmin, isDeliveryStaff } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return

    return subscribeAdminOrders(
      { role: isDeliveryStaff ? 'delivery' : 'admin', uid: profile.uid },
      (next) => {
        setOrders(next)
        setLoading(false)
        setError(null)
      },
      (snapshotError) => {
        setError(describeFirebaseError(snapshotError, 'Deliveries could not be loaded.'))
        setLoading(false)
      },
    )
  }, [profile, isDeliveryStaff])

  useEffect(() => {
    if (!isAdmin) return

    let cancelled = false
    fetchDeliveryStaff()
      .then((result) => {
        if (!cancelled) setStaff(result)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const readyOrders = orders.filter((order) => order.orderStatus === 'READY')
  const onTheWay = orders.filter((order) => order.orderStatus === 'OUT_FOR_DELIVERY')
  const failed = orders.filter((order) => order.orderStatus === 'DELIVERY_FAILED')

  const advance = async (order: Order, next: OrderStatus) => {
    if (!profile) return
    setBusy(order.orderNumber)
    setError(null)

    try {
      await updateOrderStatus(order.orderNumber, order.orderStatus, next, profile.name || profile.uid)
      setOrders((current) =>
        current.map((entry) =>
          entry.orderNumber === order.orderNumber ? { ...entry, orderStatus: next } : entry,
        ),
      )
    } catch (statusError) {
      setError(describeFirebaseError(statusError, 'The delivery status could not be updated.'))
    } finally {
      setBusy(null)
    }
  }

  const assign = async (order: Order, uid: string) => {
    setBusy(order.orderNumber)
    setError(null)

    const member = staff.find((entry) => entry.uid === uid) ?? null

    try {
      await assignDelivery(order.orderNumber, member)
      setOrders((current) =>
        current.map((entry) =>
          entry.orderNumber === order.orderNumber
            ? { ...entry, assignedTo: member?.uid ?? null, assignedToName: member?.name ?? null }
            : entry,
        ),
      )
    } catch (assignError) {
      setError(describeFirebaseError(assignError, 'Delivery could not be assigned.'))
    } finally {
      setBusy(null)
    }
  }

  const renderOrder = (order: Order) => (
    <li
      key={order.orderNumber}
      className="rounded-[20px] border border-cream-300/80 bg-cream-50 p-4 shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link
            to={`/admin/orders/${order.orderNumber}`}
            className="text-[13.5px] font-semibold text-forest-900 hover:text-forest-600"
          >
            {order.orderNumber}
          </Link>
          <p className="text-[11.5px] text-forest-900/60">
            {order.customerName} · {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.orderStatus} />
          <span className="text-[13px] font-semibold tabular-nums text-forest-900">
            {formatPKR(order.total)}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-[12.5px] text-forest-900/75 sm:grid-cols-2">
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tea-500" aria-hidden="true" />
          <span>
            {order.building} · {order.floor} · {order.officeOrShop}
          </span>
        </p>
        <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 hover:text-forest-900">
          <Phone className="h-3.5 w-3.5 text-tea-500" aria-hidden="true" />
          {order.phone}
        </a>
      </div>

      {order.deliveryInstructions && (
        <p className="mt-2 rounded-xl bg-cream-100 px-3 py-2 text-[12px] leading-relaxed text-forest-900/70">
          {order.deliveryInstructions}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {nextStatuses(order.orderStatus)
          .filter((status) => DELIVERY_STAFF_STATUSES.includes(status))
          .map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => advance(order, status)}
              disabled={busy === order.orderNumber}
              className={buttonClasses(
                status === 'DELIVERY_FAILED' ? 'secondary' : 'primary',
                'sm',
              )}
            >
              {ACTION_LABELS[status] ?? status}
            </button>
          ))}

        {isAdmin && (
          <select
            value={order.assignedTo ?? ''}
            onChange={(event) => void assign(order, event.target.value)}
            disabled={busy === order.orderNumber}
            aria-label={`Assign delivery for ${order.orderNumber}`}
            className="h-9 rounded-full border border-forest-900/15 bg-cream-50 px-3 text-[11.5px] text-forest-900 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            <option value="">Unassigned</option>
            {staff.map((member) => (
              <option key={member.uid} value={member.uid}>
                {member.name}
              </option>
            ))}
          </select>
        )}

        {order.assignedToName && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-2.5 py-1 text-[11px] font-medium text-forest-800">
            <Truck className="h-3 w-3" aria-hidden="true" />
            {order.assignedToName}
          </span>
        )}
      </div>
    </li>
  )

  return (
    <Container>
      <div>
        <h1 className="font-display text-[30px] leading-tight text-forest-900">Delivery</h1>
        <p className="mt-1 text-[13px] text-forest-900/65">
          {isAdmin
            ? 'Assign ready orders to delivery staff and monitor progress. Everything stays inside this admin panel.'
            : 'These are the deliveries assigned to you.'}
        </p>
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

      {loading ? (
        <div className="mt-6 rounded-[24px] border border-cream-300/80 bg-cream-50 px-5 py-12 text-center shadow-card">
          <span
            aria-hidden="true"
            className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-forest-900/15 border-t-forest-800"
          />
          <p className="mt-3 text-[13px] text-forest-900/60">Loading deliveries…</p>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tea-500">
              Ready for delivery ({readyOrders.length})
            </h2>
            {readyOrders.length === 0 ? (
              <p className="mt-2 rounded-[20px] border border-dashed border-cream-300 bg-cream-50/60 px-4 py-6 text-[12.5px] text-forest-900/55">
                No orders are marked ready yet. Accept and prepare orders from the Orders screen.
              </p>
            ) : (
              <ul className="mt-3 grid gap-3 xl:grid-cols-2">{readyOrders.map(renderOrder)}</ul>
            )}
          </section>

          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tea-500">
              Out for delivery ({onTheWay.length})
            </h2>
            {onTheWay.length === 0 ? (
              <p className="mt-2 rounded-[20px] border border-dashed border-cream-300 bg-cream-50/60 px-4 py-6 text-[12.5px] text-forest-900/55">
                Nothing is on the way right now.
              </p>
            ) : (
              <ul className="mt-3 grid gap-3 xl:grid-cols-2">{onTheWay.map(renderOrder)}</ul>
            )}
          </section>

          {failed.length > 0 && (
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tea-500">
                Delivery failed ({failed.length})
              </h2>
              <ul className="mt-3 grid gap-3 xl:grid-cols-2">{failed.map(renderOrder)}</ul>
            </section>
          )}
        </div>
      )}
    </Container>
  )
}
