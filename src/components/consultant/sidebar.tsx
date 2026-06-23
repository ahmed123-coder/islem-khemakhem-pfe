'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings2, 
  LogOut,
  Award,
  MessageSquare
} from 'lucide-react'
import { DashboardSidebar, SidebarNavGroup } from '@/components/dashboard/DashboardSidebar'

export function ConsultantSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1] || 'en'
  const t = useTranslations('dashboard.consultant')
  const commonT = useTranslations('common')

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${locale}/login`)
  }

  const groups: SidebarNavGroup[] = [
    {
      title: 'Productivity',
      items: [
        { href: `/${locale}/consultant`, label: t('workspace'), icon: LayoutDashboard },
        { href: `/${locale}/consultant/reservations`, label: t('reservations'), icon: Calendar },
        { href: `/${locale}/consultant/clients`, label: t('clients'), icon: Users },
        { href: `/${locale}/consultant/reviews`, label: t('reviewsLink'), icon: MessageSquare },
        { href: `/${locale}/consultant/portfolio`, label: t('portfolio'), icon: Award },
      ]
    },
    {
      title: 'Account',
      items: [
        { href: `/${locale}/consultant/settings`, label: t('settings'), icon: Settings2 },
      ]
    }
  ]

  const footer = (
    <div className="p-5 rounded-[32px] bg-emerald-950 text-white shadow-2xl shadow-emerald-200/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl transition-transform group-hover:scale-150" />
      <div className="flex items-center gap-2 mb-2">
         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{commonT('onlineNow')}</span>
      </div>
      <p className="text-xs font-bold text-slate-300 mb-4 leading-relaxed">{commonT('readyForHighImpact')}</p>
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-xs font-black text-white hover:text-emerald-400 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        {commonT('signOut')}
      </button>
    </div>
  )

  return (
    <DashboardSidebar
      theme="consultant"
      brandName="DSL Hub"
      brandSubtitle={t('expertSpace')}
      brandGradient="from-emerald-600 to-teal-500"
      groups={groups}
      footer={footer}
    />
  )
}