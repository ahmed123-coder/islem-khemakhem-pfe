'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = /\/(en|fr)\/(admin|consultant|client)/.test(pathname) || 
    pathname?.includes('/admin') || pathname?.includes('/consultant') || pathname?.includes('/client')

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      {!pathname?.match(/\/(en|fr)\/(login|register)/) && pathname !== '/login' && pathname !== '/register' && <Footer />}
    </>
  )
}
