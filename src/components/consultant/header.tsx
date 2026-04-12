'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Bell, 
  ChevronDown, 
  Calendar as CalendarIcon,
  Zap,
  Menu,
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  Settings2,
  Sparkles
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface ConsultantHeaderProps {
  user: {
    name: string
    email: string
  } | null
}

export function ConsultantHeader({ user }: ConsultantHeaderProps) {
  const [greeting, setGreeting] = React.useState('')
  const pathname = usePathname()

  const navItems = [
    { href: '/consultant', label: 'Workspace', icon: LayoutDashboard },
    { href: '/consultant/reservations', label: 'Reservations', icon: Calendar },
    { href: '/consultant/clients', label: 'Clients', icon: Users },
    { href: '/consultant/portfolio', label: 'Portfolio', icon: Award },
    { href: '/consultant/settings', label: 'Settings', icon: Settings2 },
  ]

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  return (
    <header className="h-24 sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-white/40 px-6 md:px-12 flex items-center justify-between">
      
      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-none bg-white">
            <div className="p-8 h-full flex flex-col">
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
