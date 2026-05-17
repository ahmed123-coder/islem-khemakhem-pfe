'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/context/SidebarContext'

export interface SidebarNavItem {
  href: string
  label: string
  icon: React.ElementType
}

export interface SidebarNavGroup {
  title?: string
  items: SidebarNavItem[]
}

interface DashboardSidebarProps {
  theme?: 'admin' | 'client' | 'consultant'
  brandName: string
  brandSubtitle: string
  brandGradient?: string
  groups: SidebarNavGroup[]
  footer?: React.ReactNode
}

export function DashboardSidebar({
  theme = 'admin',
  brandName,
  brandSubtitle,
  brandGradient = 'from-blue-600 to-indigo-500',
  groups,
  footer
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const { isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse } = useSidebar()

  // Color scheme mappings
  const themeColors = {
    admin: {
      activeBg: 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-blue-600',
      activeText: 'text-blue-600',
      hoverBg: 'hover:text-slate-900 hover:bg-slate-100/50',
      indicator: 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]',
      accent: 'text-blue-600',
      sidebarBg: 'bg-white/50 backdrop-blur-xl border-r border-slate-200/60'
    },
    client: {
      activeBg: 'bg-blue-600/10 text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.1)]',
      activeText: 'text-blue-600',
      hoverBg: 'hover:text-blue-600 hover:bg-slate-100/50',
      indicator: 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]',
      accent: 'text-blue-500',
      sidebarBg: 'bg-white/70 backdrop-blur-2xl border-r border-slate-200/60'
    },
    consultant: {
      activeBg: 'bg-emerald-600/10 text-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.1)]',
      activeText: 'text-emerald-600',
      hoverBg: 'hover:text-emerald-600 hover:bg-emerald-50/50',
      indicator: 'bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.5)]',
      accent: 'text-emerald-500',
      sidebarBg: 'bg-white/70 backdrop-blur-2xl border-r border-slate-200/60'
    }
  }[theme]

  const navItemVariants = {
    expanded: { width: 'auto', opacity: 1, display: 'block' },
    collapsed: { width: 0, opacity: 0, transitionEnd: { display: 'none' } }
  }

  const renderNavGroup = (group: SidebarNavGroup, groupIdx: number) => {
    return (
      <div key={groupIdx} className="space-y-2">
        {group.title && !isCollapsed && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4"
          >
            {group.title}
          </motion.p>
        )}
        <div className="space-y-1">
          {group.items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="group relative block" title={isCollapsed ? item.label : undefined}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 relative z-10",
                    isCollapsed ? "justify-center px-2 py-3" : "",
                    isActive 
                      ? themeColors.activeBg 
                      : cn("text-slate-500", themeColors.hoverBg)
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  
                  {!isCollapsed && (
                    <span className={cn(
                      "text-sm font-semibold uppercase tracking-wider transition-all duration-300",
                      theme === 'admin' ? 'font-medium normal-case tracking-normal' : ''
                    )}>
                      {item.label}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId={`${theme}-sidebar-active`}
                      className={cn(
                        "absolute w-1.5 h-6 rounded-r-full",
                        isCollapsed ? "left-0 top-1/2 -translate-y-1/2" : theme === 'client' ? "left-[-8px]" : "left-0"
                      )}
                      style={{ backgroundColor: theme === 'consultant' ? '#059669' : '#2563eb' }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // Sidebar Layout Sidebar Shared Content
  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand Header */}
      <div className={cn(
        "p-6 flex items-center justify-between",
        isCollapsed ? "px-4 justify-center" : "px-8"
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-2xl bg-gradient-to-tr flex items-center justify-center shadow-lg shrink-0",
            brandGradient,
            theme === 'admin' ? 'shadow-blue-200' : theme === 'client' ? 'shadow-blue-100' : 'shadow-emerald-100'
          )}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0"
            >
              <h1 className="text-lg font-black tracking-tight text-slate-900 truncate">
                {brandName}
              </h1>
              <p className={cn("text-[10px] font-black uppercase tracking-widest truncate", themeColors.accent)}>
                {brandSubtitle}
              </p>
            </motion.div>
          )}
        </div>

        {/* Desktop Collapse Trigger (on the Sidebar itself) */}
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar">
        {groups.map((group, idx) => renderNavGroup(group, idx))}
      </div>

      {/* Footer Content */}
      {footer && (
        <div className={cn("p-6 pt-0 mt-auto", isCollapsed ? "px-2 text-center" : "px-8")}>
          {!isCollapsed ? (
            footer
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center" title="System Status: Online">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* 1. DESKTOP/TABLET SIDEBAR (lg and above) */}
      <motion.aside
        animate={{ width: isCollapsed ? '80px' : '288px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 z-40 overflow-hidden select-none border-r border-slate-200/60",
          themeColors.sidebarBg
        )}
      >
        {sidebarContent}
        {/* Desktop Expand Trigger when Collapsed */}
        {isCollapsed && (
          <div className="absolute top-7 right-[-10px] group-hover:right-2 transition-all">
            <button
              onClick={toggleCollapse}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-800 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.aside>

      {/* 2. MOBILE DRAWER (Below lg) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
              aria-hidden="true"
            />

            {/* Slide-in Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className={cn(
                "fixed top-0 bottom-0 left-0 w-72 h-full z-50 lg:hidden shadow-2xl flex flex-col overflow-hidden",
                themeColors.sidebarBg
              )}
            >
              {/* Close Button on Mobile Drawer */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center z-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>

              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
