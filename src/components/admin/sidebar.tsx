'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('dashboard.admin')
  const commonT = useTranslations('common')

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${locale}/login`)
  }

  const groups: SidebarNavGroup[] = [
    {
      title: t('systemManagement'),
      items: [
        { href: `/${locale}/admin`, label: t('overview'), icon: LayoutDashboard },
        { href: `/${locale}/admin/users`, label: t('users'), icon: Users },
        { href: `/${locale}/admin/consultants`, label: t('consultants'), icon: UserSquare2 },
        { href: `/${locale}/admin/subscriptions`, label: t('subscriptions'), icon: CreditCard },
        { href: `/${locale}/admin/billing`, label: t('billingManagement'), icon: Receipt },
        { href: `/${locale}/admin/reviews`, label: t('reviews'), icon: Star },
      ]
    },
    {
      title: t('contentAndMedia'),
      items: [
        { href: `/${locale}/admin/content`, label: t('siteEditor'), icon: Settings2 },
        { href: `/${locale}/admin/approches`, label: t('approches'), icon: FileEdit },
        { href: `/${locale}/admin/solution`, label: t('solutions'), icon: Briefcase },
        { href: `/${locale}/admin/contacts`, label: t('contacts'), icon: Mail },
        { href: `/${locale}/admin/faqs`, label: t('faqs'), icon: HelpCircle },
      ]
    }
  ]

  const footer = (
    <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl transition-transform group-hover:scale-150" />
      <p className="text-xs font-medium text-slate-400 mb-1">{commonT('status')}</p>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm font-semibold">{commonT('systemOnline')}</span>
      </div>
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
      >
        <LogOut className="w-4 h-4" />
        {commonT('signOut')}
      </button>
    </div>
  )

  return (
    <DashboardSidebar
      theme="admin"
      brandName="DSL Admin"
      brandSubtitle={t('premiumConsole')}
      brandGradient="from-blue-600 to-indigo-500"
      groups={groups}
      footer={footer}
    />
  )
}