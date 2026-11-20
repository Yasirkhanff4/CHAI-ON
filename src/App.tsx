import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { RequireAdmin } from '@/components/admin/RouteGuards'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { AuthProvider } from '@/context/AuthProvider'
import { CartProvider } from '@/context/CartProvider'
import { CatalogProvider } from '@/context/CatalogProvider'
import { SettingsProvider } from '@/context/SettingsProvider'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { ContactPage } from '@/pages/ContactPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { HomePage } from '@/pages/HomePage'
import { MenuPage } from '@/pages/MenuPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage'
import { TrackOrderPage } from '@/pages/TrackOrderPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminDeliveryPage } from '@/pages/admin/AdminDeliveryPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'

export default function App() {
  return (
    <SettingsProvider>
      <CatalogProvider>
        <CartProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Customer website */}
                <Route element={<SiteLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="menu" element={<MenuPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route
                    path="order-confirmation/:orderNumber"
                    element={<OrderConfirmationPage />}
                  />
                  <Route path="track" element={<TrackOrderPage />} />

                  <Route path="forgot-password" element={<ForgotPasswordPage />} />

                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Staff panel: separate shell, protected by claims-checked auth */}
                <Route path="admin/login" element={<AdminLoginPage />} />
                <Route path="admin" element={<AdminLayout />}>
                  <Route
                    index
                    element={
                      <RequireAdmin>
                        <AdminDashboardPage />
                      </RequireAdmin>
                    }
                  />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="orders/:orderNumber" element={<AdminOrderDetailPage />} />
                  <Route path="delivery" element={<AdminDeliveryPage />} />
                  <Route
                    path="products"
                    element={
                      <RequireAdmin>
                        <AdminProductsPage />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <RequireAdmin>
                        <AdminSettingsPage />
                      </RequireAdmin>
                    }
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </CartProvider>
      </CatalogProvider>
    </SettingsProvider>
  )
}
