'use client'

import React, { useState, useEffect } from 'react'
import NotificationBell from './NotificationBell'

interface HeaderProps {
    title: string
}

export default function Header({ title }: HeaderProps) {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(localStorage.getItem('role'))
  }, [])

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      
      <div className="flex items-center gap-6">
        <NotificationBell />
        
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
        
        <button className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
            {role?.charAt(0) || 'U'}
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs font-bold text-gray-900 leading-none">Mon Compte</p>
            <p className="text-[10px] text-gray-500 mt-1 capitalize leading-none">{role?.toLowerCase()}</p>
          </div>
        </button>
      </div>
    </header>
  )
}
