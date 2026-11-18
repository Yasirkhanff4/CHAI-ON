import { useEffect, useState } from 'react'
import { AlertCircle, Armchair, ClipboardList, Clock, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/context/authContext'
import { buttonClasses } from '@/lib/buttonStyles'
import { formatDateTime, formatPKR } from '@/lib/format'
import { ACTIVE_STATUSES } from '@/lib/orderFlow'
import { describeFirebaseError } from '@/lib/firebase/errors'
import { subscribeAdminOrders } from '@/services/admin'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { Order } from '@/types/order'

const karachiDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Karachi',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function isToday(iso: string, today: string): boolean {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false
  return karachiDay.format(date) === today
}

export function AdminDashboardPage() {
  useDocumentTitle('Dashboard — CHAI ON Admin')
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return

    return subscribeAdminOrders(
      { role: 'admin', uid: profile.uid },
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
  }, [profile])

  const today = karachiDay.format(new Date())
  const todaysOrders = orders.filter((order) => isToday(order.createdAt, today))
  const pending = orders.filter((order) => ACTIVE_STATUSES.includes(order.orderStatus))
  const completedToday = todaysOrders.filter((order) => order.orderStatus === 'DELIVERED')
  const todaysSales = completedToday.reduce((sum, order) => sum + order.total, 0)

  const stats = [
    {
      label: "Today's orders",
      value: String(todaysOrders.length),
      hint: 'Placed since midnight',
      icon: ClipboardList,
    },
    {
      label: 'Pending orders',
      value: String(pending.length),
      hint: 'New, accepted, preparing, ready or out',
      icon: Clock,
    },
    {
      label: 'Completed today',
      value: String(completedToday.length),
      hint: 'Delivered and paid on delivery',
      icon: Armchair,
    },
    {
      label: "Today's sales",
      value: formatPKR(todaysSales),
      hint: 'Delivered orders only',
      icon: TrendingUp,
    },
  ]

  return (
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[30px] leading-tight text-forest-900">Dashboard</h1>
          <p className="mt-1 text-[13px] text-forest-900/65">
            Live figures from Firestore. Nothing on this screen is simulated.
          </p>
        </div>
        <Link to="/admin/orders" className={buttonClasses('primary', 'md')}>
          Manage orders
        </Link>
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[24px] border border-cream-300/80 bg-cream-50 p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tea-500">
                {stat.label}
              </p>
              <stat.icon className="h-4 w-4 text-forest-900/35" aria-hidden="true" />
            </div>
            <p className="mt-2 font-display text-[32px] leading-none text-forest-900">
              {loading ? '—' : stat.value}
            </p>
            <p className="mt-1.5 text-[11px] text-forest-900/55">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-cream-300/80 bg-cream-50 shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-cream-300/80 px-5 py-4">
          <h2 className="font-display text-[22px] leading-tight text-forest-900">
            Latest activity
          </h2>
          <Link
            to="/admin/orders"
            className="text-[12.5px] font-medium text-forest-800 hover:text-forest-600"
          >
            View all
          </Link>
        </div>

        {loading && (
          <div className="px-5 py-10 text-center">
            <span
              aria-hidden="true"
              className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-forest-900/15 border-t-forest-800"
            />
            <p className="mt-3 text-[13px] text-forest-900/60">Loading orders…</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <p className="px-5 py-10 text-center text-[13px] text-forest-900/60">
            No orders yet. New orders appear here the moment they are placed.
          </p>
        )}

        {!loading && orders.length > 0 && (
          <ul className="divide-y divide-cream-300/70">
            {orders.slice(0, 6).map((order) => (
              <li key={order.orderNumber}>
                <Link
                  to={`/admin/orders/${order.orderNumber}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-cream-100/70"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-forest-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-forest-900/60">
                      {order.customerName} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold tabular-nums text-forest-900">
                      {formatPKR(order.total)}
                    </span>
                    <StatusBadge status={order.orderStatus} />
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
