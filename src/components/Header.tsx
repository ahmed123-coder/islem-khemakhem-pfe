'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Zap, MessageSquare, Calendar, Rocket, Info, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { formatDistanceToNow } from 'date-fns'
import { SidebarToggle } from '@/components/dashboard/SidebarToggle'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const t = useTranslations('client.dashboard')
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // ── Chargement initial du profil ─────────────────────────────────
  useEffect(() => {
    setMounted(true)
    fetch('/api/client/profile')
      .then(res => res.json())
      .then(result => setUser(result.data || result))
      .catch(() => {})

    fetchNotifications()

    // ✅ Écoute les notifications socket
    const handleNewNotification = () => fetchNotifications()
    window.addEventListener('notification', handleNewNotification)

    // ✅ Écoute la mise à jour du profil depuis la page settings
    // Déclenché par window.dispatchEvent('profile-updated') dans settings/page.tsx
    const handleProfileUpdate = (e: CustomEvent) => {
      setUser((prev: any) => ({
        ...prev,
        name: e.detail.name || prev?.name,
        firstName: e.detail.firstName || prev?.firstName,
      }))
    }
    window.addEventListener('profile-updated', handleProfileUpdate as EventListener)

    // ✅ Écoute la mise à jour depuis l'espace admin ou consultant via socket
    // Quand admin/consultant modifie les données du client → socket émet 'profile-updated'
    const handleSocketProfileUpdate = (e: CustomEvent) => {
      if (e.detail?.name || e.detail?.firstName) {
        setUser((prev: any) => ({
          ...prev,
          name: e.detail.name || prev?.name,
          firstName: e.detail.firstName || prev?.firstName,
          phone: e.detail.phone || prev?.phone,
          company: e.detail.company || prev?.company,
        }))
      }
    }
    window.addEventListener('socket-profile-updated', handleSocketProfileUpdate as EventListener)

    return () => {
      window.removeEventListener('notification', handleNewNotification)
      window.removeEventListener('profile-updated', handleProfileUpdate as EventListener)
      window.removeEventListener('socket-profile-updated', handleSocketProfileUpdate as EventListener)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const result = await res.json()
        const data = result.data || []
        setNotifications(data)
        setUnreadCount(Array.isArray(data) ? data.filter((n: any) => !n.isRead).length : 0)
      }
    } catch {}
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
    } catch {}
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' })
      fetchNotifications()
    } catch {}
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE':     return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'RESERVATION': return <Calendar className="w-4 h-4 text-purple-500" />
      case 'MISSION':     return <Rocket className="w-4 h-4 text-orange-500" />
      case 'ORDER':       return <CheckCircle2 className="w-4 h-4 text-green-500" />
      default:            return <Info className="w-4 h-4 text-slate-400" />
    }
  }

  // ── Nom affiché — prénom + nom ou fallback ───────────────────────
  const displayName = user
    ? [user.firstName, user.name].filter(Boolean).join(' ') || user.email || 'Client'
    : ''

  // ── Initiales pour l'avatar ──────────────────────────────────────
  const initials = user
    ? ((user.firstName?.[0] || '') + (user.name?.[0] || '')).toUpperCase() || 'CL'
    : 'CL'

  if (!mounted) return null

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-end px-8 md:px-12 sticky top-0 z-40 font-sans">
      
      <SidebarToggle theme="client" />

      {/* Droite — notifications + avatar */}
      <div className="flex items-center gap-4 md:gap-6 ml-4">
        <div className="flex items-center gap-2 pr-6 border-r border-slate-200">
          <LanguageSwitcher />

          {/* Cloche notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-2xl hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all active:scale-95 group outline-none">
                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-[2rem] shadow-2xl border-slate-100 overflow-hidden bg-white/95 backdrop-blur-xl">
              <div className="p-6 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                <div>
                  <DropdownMenuLabel className="p-0 text-base font-black text-slate-900 leading-tight">
                    {t('notifications')}
                  </DropdownMenuLabel>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {t('unreadAlerts', { count: unreadCount })}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-lg px-2"
                  >
                    {t('markAllRead')}
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[350px]">
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
                        <Bell className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 mb-1">{t('stayUpdated')}</p>
                      <p className="text-[11px] font-medium text-slate-400">{t('activityUpdates')}</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className={cn(
                          "p-4 rounded-2xl mb-1 cursor-pointer transition-all flex items-start gap-3 border border-transparent",
                          !n.isRead ? "bg-blue-50/30 border-blue-50" : "hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                          !n.isRead ? "bg-blue-600 text-white" : "bg-white border border-slate-100 text-slate-400"
                        )}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs leading-relaxed mb-1", !n.isRead ? "font-bold text-slate-900" : "font-medium text-slate-500")}>
                            {n.title}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-normal mb-2">{n.message}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </p>
                            {!n.isRead && (
                              <button
                                onClick={(e) => markAsRead(e, n.id)}
                                className="text-[9px] font-black uppercase text-blue-600 hover:underline"
                              >
                                {t('markAsRead')}
                              </button>
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all active:scale-95">
            <Zap className="w-5 h-5" />
          </Button>
        </div>

        {/* ✅ Avatar avec initiales et nom mis à jour en temps réel */}
        <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-2xl transition-all group">
          <Avatar className="w-10 h-10 border-2 border-white shadow-lg shadow-blue-100 ring-2 ring-blue-50">
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-black uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-black text-slate-900 leading-none mb-1">
              {displayName || t('myPortal')}
            </p>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">
              {t('standardMember')}
            </p>
          </div>
        </button>
      </div>
    </header>
  )
}