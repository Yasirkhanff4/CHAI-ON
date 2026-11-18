import {
  CheckCircle2,
  ClipboardList,
  MapPin,
  ShieldCheck,
  UserPlus,
  UserRound,
  Wallet,
} from 'lucide-react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { CartProvider } from '@/context/CartProvider'
import { CartPage } from '@/pages/CartPage'
import { ComingSoonPage } from '@/pages/ComingSoonPage'
import { ContactPage } from '@/pages/ContactPage'
import { HomePage } from '@/pages/HomePage'
import { MenuPage } from '@/pages/MenuPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="contact" element={<ContactPage />} />

            <Route path="menu" element={<MenuPage />} />
            <Route path="cart" element={<CartPage />} />

            <Route
              path="checkout"
              element={
                <ComingSoonPage
                  documentTitle="Checkout — CHAI ON"
                  icon={Wallet}
                  phase="Phase 3"
                  title="Checkout is on its way."
                  description="Your cart is saved. Guest checkout, delivery details and cash on delivery are being built next — no account will be required."
                />
              }
            />
            <Route
              path="order-confirmation"
              element={
                <ComingSoonPage
                  documentTitle="Order confirmation — CHAI ON"
                  icon={CheckCircle2}
                  phase="Phase 3"
                  title="Your order confirmation will live here."
                  description="Right after checkout, you will see your order number, delivery details and a link to track the order."
                />
              }
            />
            <Route
              path="track"
              element={
                <ComingSoonPage
                  documentTitle="Track order — CHAI ON"
                  icon={MapPin}
                  phase="Phase 6"
                  title="Order tracking is coming."
                  description="Soon you will be able to check every step from received to delivered using your order number and phone number."
                />
              }
            />
            <Route
              path="login"
              element={
                <ComingSoonPage
                  documentTitle="Log in — CHAI ON"
                  icon={UserRound}
                  phase="Phase 4"
                  title="Customer login is on the way."
                  description="Accounts will let you save your delivery details and revisit your order history. Guest checkout will always stay available."
                />
              }
            />
            <Route
              path="register"
              element={
                <ComingSoonPage
                  documentTitle="Create account — CHAI ON"
                  icon={UserPlus}
                  phase="Phase 4"
                  title="Accounts are being set up."
                  description="Register once to save your office delivery details and see your past orders. No account is needed to order."
                />
              }
            />
            <Route
              path="my-orders"
              element={
                <ComingSoonPage
                  documentTitle="My orders — CHAI ON"
                  icon={ClipboardList}
                  phase="Phase 4"
                  title="Your order history is coming."
                  description="Once customer accounts are live, every order you place will be listed here with its latest status."
                />
              }
            />
            <Route
              path="admin/login"
              element={
                <ComingSoonPage
                  documentTitle="Admin login — CHAI ON"
                  icon={ShieldCheck}
                  phase="Phase 5"
                  title="Admin access is being secured."
                  description="The admin panel is for CHAI ON staff only. Admin accounts are provisioned by the owner — there is no public admin registration."
                />
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
