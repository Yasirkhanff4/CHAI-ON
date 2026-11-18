import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/context/authContext'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { formatDateTime, formatPKR } from '@/lib/format'
import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import { subscribeAdminOrders } from '@/services/admin'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { Order } from '@/types/order'
import type { OrderStatus } from '@/types'

const STATUS_FILTERS: ('ALL' | OrderStatus)[] = [
  'ALL',
  'NEW',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'REJECTED',
  'CANCELLED',
  'DELIVERY_FAILED',
]

export function AdminOrdersPage() {
  useDocumentTitle('Orders — CHAI ON Admin')
  const { profile, isDeliveryStaff } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL')

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
        setError(describeFirebaseError(snapshotError, 'Orders could not be loaded.'))
        setLoading(false)
      },
    )
  }, [profile, isDeliveryStaff])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return orders.filter((order) => {
      if (status !== 'ALL' && order.orderStatus !== status) return false
      if (!term) return true

      return (
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.phone.toLowerCase().includes(term) ||
        order.building.toLowerCase().includes(term)
      )
    })
  }, [orders, search, status])

  return (
    <Container>
      <div>
        <h1 className="font-display text-[30px] leading-tight text-forest-900">Orders</h1>
        <p className="mt-1 text-[13px] text-forest-900/65">
          {isDeliveryStaff
            ? 'Only deliveries assigned to you are listed.'
            : 'All orders, newest first. Search by order number, customer name or phone.'}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-900/40"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number, name, phone or building"
            aria-label="Search orders"
            className="h-11 w-full rounded-full border border-forest-900/15 bg-cream-50 pl-11 pr-4 text-[13.5px] text-forest-900 placeholder:text-forest-900/40 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          />
        </div>

        <label className="flex items-center gap-2 text-[12px] font-medium text-forest-900/70">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'ALL' | OrderStatus)}
            className="h-11 rounded-full border border-forest-900/15 bg-cream-50 px-3 text-[13px] text-forest-900 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All statuses' : ORDER_STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3 text-[13px] text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="mt-5 rounded-[24px] border border-cream-300/80 bg-cream-50 shadow-card">
        {loading && (
          <div className="px-5 py-12 text-center">
            <span
              aria-hidden="true"
              className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-forest-900/15 border-t-forest-800"
            />
            <p className="mt-3 text-[13px] text-forest-900/60">Loading orders…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="px-5 py-12 text-center text-[13px] text-forest-900/60">
            {orders.length === 0
              ? 'No orders yet.'
              : 'No orders match this search or status filter.'}
          </p>
        )}

        {!loading && filtered.length > 0 && (
          <ul className="divide-y divide-cream-300/70">
            {filtered.map((order) => (
              <li key={order.orderNumber}>
                <Link
                  to={`/admin/orders/${order.orderNumber}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition hover:bg-cream-100/70 sm:px-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13.5px] font-semibold text-forest-900">
                        {order.orderNumber}
                      </p>
                      <StatusBadge status={order.orderStatus} />
                    </div>
                    <p className="mt-1 text-[12px] text-forest-900/70">
                      {order.customerName} · {order.phone}
                    </p>
                    <p className="text-[11.5px] text-forest-900/55">
                      {order.building} · {order.floor} · {order.officeOrShop}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[14px] font-semibold tabular-nums text-forest-900">
                      {formatPKR(order.total)}
                    </p>
                    <p className="text-[11px] text-forest-900/55">
                      {order.itemCount} {order.itemCount === 1 ? 'cup' : 'cups'} ·{' '}
                      {formatDateTime(order.createdAt)}
                    </p>
                    <p className="text-[10.5px] uppercase tracking-[0.1em] text-forest-900/45">
                      {order.paymentStatus === 'PAID' ? 'Paid' : 'COD unpaid'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  )
}
