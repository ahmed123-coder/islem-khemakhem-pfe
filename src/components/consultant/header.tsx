'use client'

import * as React from 'react'
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Calendar as CalendarIcon,
  Zap
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConsultantHeaderProps {
  user: {
    name: string
    email: string
  } | null
}

export function ConsultantHeader({ user }: ConsultantHeaderProps) {
  const [greeting, setGreeting] = React.useState('')

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  return (
    <header className="h-24 sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-white/40 px-8 md:px-12 flex items-center justify-between">
      <div className="flex-1 max-w-lg hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search workspace... (CMD+J)"
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600/20 text-sm font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
           <Button variant="ghost" size="icon" className="relative rounded-2xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-50" />
           </Button>
           <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600">
              <Zap className="w-5 h-5" />
           </Button>
        </div>

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
              <AvatarFallback className="bg-emerald-600 text-white font-black text-xs">
                {user?.name?.[0] || 'E'}
              </AvatarFallback>
           </Avatar>
        </div>
      </div>
    </header>
  )
}
