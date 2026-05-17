'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Package, Search, Settings, LogOut, Home, CreditCard } from 'lucide-react'
import { DashboardSidebar, SidebarNavGroup } from '@/components/dashboard/DashboardSidebar'

export default function ClientSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${locale}/login`)
  }

  const groups: SidebarNavGroup[] = [
    {
      items: [
        { href: `/${locale}/client`, label: 'Subscriptions', icon: Package },
        { href: `/${locale}/client/solutions`, label: 'Solutions', icon: Search },
        { href: `/${locale}/client/billing`, label: 'Billing', icon: CreditCard },
        { href: `/${locale}/client/settings`, label: 'Settings', icon: Settings },
      ]
    }
  ]

  const footer = (
    <div className="space-y-4">
      <div className="p-5 rounded-[32px] bg-slate-900 text-white shadow-2xl shadow-blue-200/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl transition-transform group-hover:scale-150" />
        <div className="relative z-10">
          <p className="text-xs font-bold text-slate-400 mb-1">Status</p>
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-sm font-bold uppercase tracking-widest">Active Client</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-black text-slate-300 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <Link 
        href={`/${locale}/`} 
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest"
      >
        <Home className="w-4 h-4" />
        Back to Site
      </Link>
    </div>
  )

  return (
    <DashboardSidebar
      theme="client"
      brandName="DSL Hub"
      brandSubtitle="Client Space"
      brandGradient="from-blue-600 to-indigo-500"
      groups={groups}
      footer={footer}
    />
  )
}