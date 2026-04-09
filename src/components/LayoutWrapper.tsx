'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideLayout = pathname?.startsWith('/admin') || pathname?.startsWith('/consultant') || pathname?.startsWith('/client')

  if (hideLayout) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      {pathname !== '/login' && pathname !== '/register' && <Footer />}
    </>
  )
}
