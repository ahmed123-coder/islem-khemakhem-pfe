'use client'

import React from 'react'
import NotificationBell from './NotificationBell'
import { Search, User } from 'lucide-react'

interface HeaderProps {
    title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
          />
        </div>

        <NotificationBell />
        
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
        
        <button className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
            {localStorage.getItem('role')?.charAt(0) || 'U'}
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs font-bold text-gray-900 leading-none">Mon Compte</p>
            <p className="text-[10px] text-gray-500 mt-1 capitalize leading-none">{localStorage.getItem('role')?.toLowerCase()}</p>
          </div>
        </button>
      </div>
    </header>
  )
}
