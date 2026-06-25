'use client'

import * as React from 'react'
import { Bell, ChevronDown, User as UserIcon, LogOut, Sparkles, MessageSquare, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { SidebarToggle } from '@/components/dashboard/SidebarToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export function AdminTopBar() {
  const router = useRouter()
  const { locale } = useParams() as { locale: string }
  const [mounted, setMounted] = React.useState(false)
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [adminName, setAdminName] = React.useState('Administrator')
  const [adminInitials, setAdminInitials] = React.useState('AD')

  React.useEffect(() => {
    setMounted(true)
    fetchNotifications()
    fetchAdminProfile()
    const handleNewNotification = (e: any) => {
      const data = e.detail
      if (data) {
        setNotifications(prev => [{ id: data.id || Math.random().toString(36).substr(2, 9), type: data.type, title: data.title, message: data.message, isRead: false, createdAt: data.timestamp || new Date().toISOString(), orderId: data.orderId }, ...prev])
        setUnreadCount(prev => prev + 1)
      }
    }
    window.addEventListener('notification', handleNewNotification)
    return () => window.removeEventListener('notification', handleNewNotification)
  }, [])

  const fetchAdminProfile = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          const fullName = [data.user.firstName, data.user.name].filter(Boolean).join(' ') || 'Administrator'
          setAdminName(fullName)
          const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
          setAdminInitials(initials)
        }
      }
    } catch {}
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const result = await res.json()
      const data = result.data || result
      if (Array.isArray(data)) {
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.isRead).length)
      }
    } catch {}
  }

  const markAsRead = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation()
    try {
      await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      fetchNotifications()
    } catch {}
  }

  const markAllAsRead = async () => {
    try { await fetch('/api/notifications', { method: 'PUT' }); fetchNotifications() } catch {}
  }

  if (!mounted) return null

  return (
    <header className="h-20 border-b border-slate-200/60 bg-white/50 backdrop-blur-xl sticky top-0 z-40 px-6 md:px-10 flex items-center justify-end font-sans">
      <SidebarToggle theme="admin" />

      <div className="flex items-center gap-3 ml-4">
        <LanguageSwitcher />
        <div className="h-6 w-px bg-slate-200/60" />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative group rounded-2xl hover:bg-slate-100/80 transition-all active:scale-95">
              <Bell className="w-5 h-5 text-slate-600 transition-transform group-hover:scale-110" />
              {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white pointer-events-none animate-pulse" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-3xl shadow-2xl border-slate-100 overflow-hidden bg-white/95 backdrop-blur-xl">
            <div className="p-5 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
              <div>
                <DropdownMenuLabel className="p-0 text-base font-bold text-slate-900 leading-tight">System Alerts</DropdownMenuLabel>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{unreadCount} Pending Notifications</p>
              </div>
              {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 text-[9px] font-bold uppercase text-blue-600 hover:bg-blue-50 rounded-lg px-2">Clear all</Button>}
            </div>
            <ScrollArea className="h-[350px]">
              <div className="p-2">
                {notifications.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4"><Bell className="w-6 h-6 text-slate-300" /></div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Queue is clear</p>
                    <p className="text-[11px] font-medium text-slate-400">System updates and user activities will notify you here.</p>
                  </div>
                ) : notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className={cn("p-4 rounded-2xl mb-1 cursor-pointer transition-all flex items-start gap-3 border border-transparent", !n.isRead ? "bg-blue-50/30 border-blue-50" : "hover:bg-slate-50")}>
                    <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm", !n.isRead ? "bg-blue-600 text-white" : "bg-white border border-slate-100 text-slate-400")}>
                      {n.type === 'MESSAGE' ? <MessageSquare className="w-4 h-4" /> : n.type === 'REVIEW' ? <Star className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs leading-relaxed mb-1", !n.isRead ? "font-bold text-slate-900" : "font-medium text-slate-500")}>{n.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-normal mb-2">{n.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        {!n.isRead && <button onClick={(e) => markAsRead(e, n.id)} className="text-[9px] font-bold uppercase text-blue-600 hover:underline">Mark read</button>}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
            
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-slate-200/60" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-100/80 transition-all outline-none group">
              <Avatar className="w-9 h-9 border-2 border-white shadow-sm transition-transform group-active:scale-95">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-xs font-bold">{adminInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{adminName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Super User</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-200 bg-white/95 backdrop-blur-xl">
            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">My Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/${locale}/admin/profile`)} className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600">
              <UserIcon className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            <DropdownMenuItem onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push(`/${locale}/login`); router.refresh() }} className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
