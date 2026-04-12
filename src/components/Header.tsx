'use client'

import React, { useState, useEffect } from 'react'
import NotificationBell from './NotificationBell'
import { Bell, Search, Zap, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
    title: string
}

export default function Header({ title }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/client/profile')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => {})
  }, [])

  if (!mounted) return null

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 md:px-12 sticky top-0 z-40 font-sans">
      <div className="flex flex-col">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {user ? `Welcome back, ${user.name || 'User'}!` : 'Welcome back!'}
        </h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
          Here is what's happening with your consulting.
        </p>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2 pr-6 border-r border-slate-200">
           <Button variant="ghost" size="icon" className="relative rounded-2xl hover:bg-blue-50 text-slate-500 hover:text-blue-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
           </Button>
           <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-blue-50 text-slate-500 hover:text-blue-600">
              <Zap className="w-5 h-5" />
           </Button>
        </div>
        
        <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-2xl transition-all group">
          <Avatar className="w-10 h-10 border-2 border-white shadow-lg shadow-blue-100 ring-2 ring-blue-50">
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-black uppercase">
              {user?.name?.substring(0, 2) || 'CL'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-black text-slate-900 leading-none mb-1">{user?.name || 'My Portal'}</p>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">Standard Member</p>
          </div>
        </button>
      </div>
    </header>
  )
}
