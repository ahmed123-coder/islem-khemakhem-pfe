'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Bell, 
  ChevronDown, 
  Zap,
  Menu,
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  Settings2,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Clock,
  Trash2,
  X,
  Check
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getSocket } from '@/lib/socket-client'

const navItems = [
  { href: '/consultant', label: 'Workspace', icon: LayoutDashboard },
  { href: '/consultant/reservations', label: 'Reservations', icon: Calendar },
  { href: '/consultant/clients', label: 'Clients', icon: Users },
  { href: '/consultant/portfolio', label: 'Portfolio', icon: Award },
  { href: '/consultant/settings', label: 'Settings', icon: Settings2 },
]

export function ConsultantHeader() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<any>(null)
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    fetch('/api/consultant/profile')
      .then(res => res.json())
      .then(result => setUser(result.data || result))
    fetchNotifications()

    const socket = getSocket()
    if (socket) {
      socket.on('notification', () => {
        fetchNotifications()
      })
    }

    return () => {
      if (socket) socket.off('notification')
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const result = await res.json()
      const data = result.data || result
      if (Array.isArray(data)) {
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }

  const markAsRead = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      fetchNotifications()
    } catch (error) {
      console.error(error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' })
      fetchNotifications()
    } catch (error) {
      console.error(error)
    }
  }

  if (!mounted) return null

  return (
    <header className="h-24 sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-white/40 px-6 md:px-12 flex items-center justify-end font-sans">
      
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Actions & Notifications */}
        <div className="flex items-center gap-2 md:gap-3 pr-4 md:pr-6 border-r border-slate-200">
           
           {/* Notifications Dropdown */}
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-2xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all active:scale-95 group">
                   <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                   {unreadCount > 0 && (
                     <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-50 animate-pulse" />
                   )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 rounded-[2rem] shadow-2xl border-slate-100 overflow-hidden bg-white/95 backdrop-blur-xl">
                 <div className="p-6 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                    <div>
                       <DropdownMenuLabel className="p-0 text-base font-black text-slate-900 leading-tight">Notifications</DropdownMenuLabel>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">You have {unreadCount} new alerts</p>
                    </div>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllAsRead}
                        className="h-7 text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-50 rounded-lg px-2"
                      >
                        Mark all read
                      </Button>
                    )}
                 </div>
                 <ScrollArea className="h-[350px]">
                    <div className="p-2">
                       {notifications.length === 0 ? (
                         <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                               <Bell className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 mb-1">Stay up to date</p>
                            <p className="text-[11px] font-medium text-slate-400">Notifications about your consultations and missions will appear here.</p>
                         </div>
                       ) : (
                         notifications.map((n) => (
                           <DropdownMenuItem 
                             key={n.id} 
                             className={cn(
                               "p-4 rounded-2xl mb-1 cursor-pointer transition-all flex items-start gap-3 border border-transparent",
                               !n.isRead ? "bg-emerald-50/30 border-emerald-50" : "hover:bg-slate-50"
                             )}
                           >
                              <div className={cn(
                                "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                !n.isRead ? "bg-emerald-600 text-white" : "bg-white border border-slate-100 text-slate-400"
                              )}>
                                 {n.type === 'MESSAGE' ? <MessageSquare className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className={cn("text-xs leading-relaxed mb-1", !n.isRead ? "font-bold text-slate-900" : "font-medium text-slate-500")}>
                                    {n.title}
                                 </p>
                                 <p className="text-[10px] text-slate-400 line-clamp-2 leading-normal mb-2">{n.message}</p>
                                 <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                       {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {!n.isRead && (
                                      <button 
                                        onClick={(e) => markAsRead(e, n.id)}
                                        className="text-[9px] font-black uppercase text-emerald-600 hover:underline"
                                      >
                                        Mark as read
                                      </button>
                                    )}
                                 </div>
                              </div>
                           </DropdownMenuItem>
                         ))
                       )}
                    </div>
                 </ScrollArea>
                 <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center">
                    <Link href="/consultant" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors">
                       View Activity Center
                    </Link>
                 </div>
              </DropdownMenuContent>
           </DropdownMenu>

           <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all active:scale-95">
              <Zap className="w-5 h-5" />
           </Button>

           {/* Mobile Menu */}
           <div className="lg:hidden ml-1">
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all active:scale-95">
                   <Menu className="w-6 h-6" />
                 </Button>
               </SheetTrigger>
               <SheetContent side="right" className="w-72 p-0 border-none bg-white">
                 <div className="p-8 h-full flex flex-col font-sans">
                   <div className="flex items-center gap-3 px-2 mb-10">
                     <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-100">
                       <Sparkles className="w-6 h-6 text-white" />
                     </div>
                     <div>
                       <h1 className="text-lg font-black tracking-tight text-slate-900">DSL Hub</h1>
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Expert Space</p>
                     </div>
                   </div>

                   <nav className="flex-1 space-y-2">
                     <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Productivity</p>
                     {navItems.map((item) => {
                       const Icon = item.icon
                       const isActive = pathname === item.href
                       return (
                         <Link key={item.href} href={item.href}>
                           <div className={cn(
                             "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm mb-1",
                             isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                           )}>
                             <Icon className="w-5 h-5" />
                             {item.label}
                           </div>
                         </Link>
                       )
                     })}
                   </nav>

                   <div className="mt-auto border-t border-slate-100 pt-6">
                      <div className="flex items-center gap-3 px-2">
                         <Avatar className="h-10 w-10 border-2 border-emerald-50">
                            <AvatarFallback className="bg-emerald-600 text-white font-bold">{user?.name?.[0] || 'E'}</AvatarFallback>
                         </Avatar>
                         <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Expert'}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate">{user?.email}</p>
                         </div>
                      </div>
                   </div>
                 </div>
               </SheetContent>
             </Sheet>
           </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none mb-1">
                {user?.name || 'Expert'}
              </p>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                Professional Level
              </p>
           </div>
           <Avatar className="w-10 h-10 border-2 border-white shadow-lg shadow-emerald-100 ring-2 ring-emerald-50">
              <AvatarImage src="" />
              <AvatarFallback className="bg-emerald-600 text-white font-black text-xs text-center flex items-center justify-center">
                {user?.name?.[0] || 'E'}
              </AvatarFallback>
           </Avatar>
        </div>
      </div>
    </header>
  )
}
