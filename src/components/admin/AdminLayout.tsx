import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Truck,
  ExternalLink,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { RequireStaff } from '@/components/admin/RouteGuards'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/context/authContext'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  DELIVERY_STAFF: 'Delivery staff',
}

export function AdminLayout() {
  const { profile, isAdmin, isDeliveryStaff, logout } = useAuth()
  const navigate = useNavigate()

  const links = [
    ...(isAdmin ? [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true }] : []),
    { label: 'Orders', to: '/admin/orders', icon: ClipboardList, end: false },
    { label: 'Delivery', to: '/admin/delivery', icon: Truck, end: false },
    ...(isAdmin ? [{ label: 'Products', to: '/admin/products', icon: Package, end: false }] : []),
    ...(isAdmin ? [{ label: 'Settings', to: '/admin/settings', icon: Settings, end: false }] : []),
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <RequireStaff>
      <div className="min-h-screen bg-cream-100">
        <header className="border-b border-forest-900/10 bg-forest-950 text-cream-100">
          <Container className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Logo onDark size="sm" showTagline={false} />
              <span className="hidden rounded-full bg-cream-50/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cream-100/80 sm:inline">
                Admin
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden text-right text-[11px] leading-tight text-cream-100/70 sm:block">
                {profile?.name}
                <br />
                <span className="text-[10px] uppercase tracking-[0.12em] text-gold-300">
                  {ROLE_LABELS[profile?.role ?? ''] ?? 'Staff'}
                </span>
              </span>
              <Link
                to="/"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cream-50/20 px-3 text-[12px] font-medium text-cream-100 transition hover:bg-cream-50/10"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">View site</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cream-50/20 px-3 text-[12px] font-medium text-cream-100 transition hover:bg-cream-50/10"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </Container>
        </header>

        <div className="border-b border-forest-900/10 bg-cream-50">
          <Container>
            <nav aria-label="Admin sections" className="-mx-1 flex gap-1 overflow-x-auto py-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    [
                      'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition',
                      isActive
                        ? 'bg-forest-800 text-cream-50'
                        : 'text-forest-900/70 hover:bg-cream-200/70 hover:text-forest-900',
                    ].join(' ')
                  }
                >
                  <link.icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </Container>
        </div>

        {isDeliveryStaff && (
          <p className="border-b border-gold-300/50 bg-gold-100 px-5 py-2 text-center text-[11.5px] text-forest-900/80">
            Delivery account: you only see orders assigned to you.
          </p>
        )}

        <main id="main" className="py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </RequireStaff>
  )
}
