'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, Search, Settings, LogOut, Home, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const links = [
    { href: '/client', label: 'Subscriptions', icon: Package },
    { href: '/client/solutions', label: 'Solutions', icon: Search },
    { href: '/client/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="hidden lg:flex w-72 flex-col h-screen border-r border-slate-200/60 bg-white/70 backdrop-blur-2xl sticky top-0 z-50 font-sans">
      <div className="p-8">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-100">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900">DSL Hub</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Client Space</p>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} className="group relative block">
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300",
                    isActive 
                      ? "bg-blue-600/10 text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                      : "text-slate-500 hover:text-blue-600 hover:bg-slate-100/50"
                  )}
                >
                  <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span className="text-sm font-bold uppercase tracking-wider">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="client-sidebar-active"
                      className="absolute left-[-8px] w-1.5 h-6 bg-blue-600 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 pt-0 space-y-4">
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
          href="/" 
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <Home className="w-4 h-4" />
          Back to Site
        </Link>
      </div>
    </aside>
  )
}
