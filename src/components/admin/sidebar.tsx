'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  ChevronRight,
  Sparkles,
  HelpCircle,
  Receipt
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
          ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-blue-600" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
      <span className="text-sm font-medium">{label}</span>
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </div>
  </Link>
)

export function AdminSidebar() {
  const pathname = usePathname()

  const systemItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/consultants', label: 'Consultants', icon: UserSquare2 },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { href: '/admin/billing', label: 'Billing', icon: Receipt },
  ]

  const contentItems = [
    { href: '/admin/content', label: 'Site Editor', icon: Settings2 },
    { href: '/admin/approches', label: 'Approches', icon: FileEdit },
    { href: '/admin/solution', label: 'Solutions', icon: Briefcase },
    { href: '/admin/contacts', label: 'Contacts', icon: Mail },
    { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  ]

  return (
    <aside className="hidden lg:flex w-72 flex-col h-screen border-r border-slate-200/60 bg-white/50 backdrop-blur-xl sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">DSL Admin</h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Premium Console</p>
          </div>
        </div>

        <nav className="space-y-8">
          <div>
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">System Management</p>
            <div className="space-y-1">
              {systemItems.map((item) => (
                <NavItem 
                  key={item.href} 
                  {...item} 
                  isActive={pathname === item.href} 
                />
              ))}
            </div>
          </div>

          <div>
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Content & Media</p>
            <div className="space-y-1">
              {contentItems.map((item) => (
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
        <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl transition-transform group-hover:scale-150" />
          <p className="text-xs font-medium text-slate-400 mb-1">Status</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold">System Online</span>
          </div>
          <button 
            onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login')}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
