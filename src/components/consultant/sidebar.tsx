'use client'

import * as React from 'react'
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
  const groups: SidebarNavGroup[] = [
    {
      title: 'Productivity',
      items: [
        { href: '/consultant', label: 'Workspace', icon: LayoutDashboard },
        { href: '/consultant/reservations', label: 'Reservations', icon: Calendar },
        { href: '/consultant/clients', label: 'Clients', icon: Users },
        { href: '/consultant/reviews', label: 'Reviews', icon: MessageSquare },
        { href: '/consultant/portfolio', label: 'Portfolio', icon: Award },
      ]
    },
    {
      title: 'Account',
      items: [
        { href: '/consultant/settings', label: 'Settings', icon: Settings2 },
      ]
    }
  ]

  const footer = (
    <div className="p-5 rounded-[32px] bg-emerald-950 text-white shadow-2xl shadow-emerald-200/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl transition-transform group-hover:scale-150" />
      <div className="flex items-center gap-2 mb-2">
         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Online Now</span>
      </div>
      <p className="text-xs font-bold text-slate-300 mb-4 leading-relaxed">Ready for high-impact consulting.</p>
      <button 
        onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login')}
        className="flex items-center gap-2 text-xs font-black text-white hover:text-emerald-400 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  )

  return (
    <DashboardSidebar
      theme="consultant"
      brandName="DSL Hub"
      brandSubtitle="Expert Space"
      brandGradient="from-emerald-600 to-teal-500"
      groups={groups}
      footer={footer}
    />
  )
}
