import { Outlet } from 'react-router-dom'
import { CartToast } from '@/components/cart/CartToast'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { FloatingWhatsAppButton } from '@/components/whatsapp/FloatingWhatsAppButton'

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-forest-900 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream-50"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartToast />
      <FloatingWhatsAppButton />
    </div>
  )
}
