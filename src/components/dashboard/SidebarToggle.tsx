'use client'

import * as React from 'react'
import { Menu } from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { Button } from '@/components/ui/button'

interface SidebarToggleProps {
  theme?: 'admin' | 'client' | 'consultant'
}

export function SidebarToggle({ theme = 'admin' }: SidebarToggleProps) {
  const { toggleMobile } = useSidebar()

  const hoverColors = {
    admin: 'hover:bg-blue-50 text-slate-500 hover:text-blue-600',
    client: 'hover:bg-blue-50 text-slate-500 hover:text-blue-600',
    consultant: 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
  }[theme]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMobile}
      className={`lg:hidden rounded-2xl active:scale-95 transition-all ${hoverColors}`}
      aria-label="Open navigation menu"
    >
      <Menu className="w-6 h-6" />
    </Button>
  )
}
