'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings2, 
  LogOut,
  Sparkles,
  Briefcase,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface NavItemProps {
  href: string
  label: string
  icon: React.ElementType
  isActive: boolean
}

const NavItem = ({ href, label, icon: Icon, isActive }: NavItemProps) => (
  <Link href={href} className="group relative">
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300",
        isActive 
          ? "bg-emerald-600/10 text-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.1)]" 
          : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
      <span className="text-sm font-semibold">{label}</span>
      {isActive && (
        <motion.div
          layoutId="consultant-sidebar-active"
          className="absolute left-0 w-1.5 h-6 bg-emerald-600 rounded-r-full shadow-[0_0_10px_rgba(5,150,105,0.5)]"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </div>
  </Link>
)

export function ConsultantSidebar() {
  const pathname = usePathname()

  const mainItems = [
    { href: '/consultant', label: 'Workspace', icon: LayoutDashboard },
    { href: '/consultant/appointments', label: 'Schedule', icon: Calendar },
    { href: '/consultant/clients', label: 'Clients', icon: Users },
    { href: '/consultant/portfolio', label: 'Portfolio', icon: Award },
  ]

  const accountItems = [
    { href: '/consultant/settings', label: 'Settings', icon: Settings2 },
  ]

  return (
    <aside className="hidden lg:flex w-64 flex-col h-screen border-r border-slate-200/60 bg-white/70 backdrop-blur-2xl sticky top-0 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-100">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900">DSL Hub</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Expert Space</p>
          </div>
        </div>

        <nav className="space-y-10">
          <div>
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Productivity</p>
            <div className="space-y-1">
              {mainItems.map((item) => (
                <NavItem 
                  key={item.href} 
                  {...item} 
                  isActive={pathname === item.href} 
                />
              ))}
            </div>
          </div>

          <div>
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Account</p>
            <div className="space-y-1">
              {accountItems.map((item) => (
                <NavItem 
                  key={item.href} 
                  {...item} 
                  isActive={pathname === item.href} 
                />
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-8 pt-0">
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
      </div>
    </aside>
  )
}
