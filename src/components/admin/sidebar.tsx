'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CreditCard, 
  Settings2, 
  FileEdit, 
  Briefcase, 
  Mail,
  LogOut,
  HelpCircle,
  Receipt,
  Star
} from 'lucide-react'
import { DashboardSidebar, SidebarNavGroup } from '@/components/dashboard/DashboardSidebar'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1] || 'en'

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${locale}/login`)
  }

  const groups: SidebarNavGroup[] = [
    {
      title: 'System Management',
      items: [
        { href: `/${locale}/admin`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/${locale}/admin/users`, label: 'Users', icon: Users },
        { href: `/${locale}/admin/consultants`, label: 'Consultants', icon: UserSquare2 },
        { href: `/${locale}/admin/subscriptions`, label: 'Subscriptions', icon: CreditCard },
        { href: `/${locale}/admin/billing`, label: 'Billing', icon: Receipt },
        { href: `/${locale}/admin/reviews`, label: 'Reviews', icon: Star },
      ]
    },
    {
      title: 'Content & Media',
      items: [
        { href: `/${locale}/admin/content`, label: 'Site Editor', icon: Settings2 },
        { href: `/${locale}/admin/approches`, label: 'Approches', icon: FileEdit },
        { href: `/${locale}/admin/solution`, label: 'Solutions', icon: Briefcase },
        { href: `/${locale}/admin/contacts`, label: 'Contacts', icon: Mail },
        { href: `/${locale}/admin/faqs`, label: 'FAQs', icon: HelpCircle },
      ]
    }
  ]

  const footer = (
    <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl transition-transform group-hover:scale-150" />
      <p className="text-xs font-medium text-slate-400 mb-1">Status</p>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm font-semibold">System Online</span>
      </div>
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  )

  return (
    <DashboardSidebar
      theme="admin"
      brandName="DSL Admin"
      brandSubtitle="Premium Console"
      brandGradient="from-blue-600 to-indigo-500"
      groups={groups}
      footer={footer}
    />
  )
}