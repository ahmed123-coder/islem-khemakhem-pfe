'use client'

import * as React from 'react'
import { 
  Search, 
  Bell, 
  Command, 
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  Moon,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function AdminTopBar() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        // Open search command palette (implemented later or via shadcn command)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!mounted) return null

  return (
    <header className="h-20 border-b border-slate-200/60 bg-white/50 backdrop-blur-xl sticky top-0 z-40 px-6 md:px-10 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
          <input 
            type="text" 
            placeholder="Search dashboard... (CMD+K)"
            className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-100/50 border-transparent transition-all focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 text-sm placeholder:text-slate-400"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white shadow-sm pointer-events-none">
            <Command className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">K</span>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative group rounded-2xl hover:bg-slate-100/80">
          <Bell className="w-5 h-5 text-slate-600 transition-transform group-hover:scale-110" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white pointer-events-none" />
        </Button>

        <div className="h-6 w-px bg-slate-200/60 mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-100/80 transition-all outline-none group">
              <Avatar className="w-9 h-9 border-2 border-white shadow-sm transition-transform group-active:scale-95">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-xs font-bold">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">Administrator</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Super User</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-200">
            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">My Account</DropdownMenuLabel>
            <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600">
              <UserIcon className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            <DropdownMenuItem 
              onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login')}
              className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
