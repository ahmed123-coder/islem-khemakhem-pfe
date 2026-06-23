'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'

interface SidebarContextType {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  toggleMobile: () => void
  toggleCollapse: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const pathname = usePathname()

  // Load initial collapsed state from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebar-collapsed')
      if (stored !== null) {
        setIsCollapsed(stored === 'true')
      }
    } catch (e) {
      console.warn('Failed to load sidebar-collapsed from localStorage', e)
    }
  }, [])

  // Persist collapsed state to localStorage
  const handleSetCollapsed = React.useCallback((val: boolean) => {
    setIsCollapsed(val)
    try {
      localStorage.setItem('sidebar-collapsed', String(val))
    } catch (e) {
      console.warn('Failed to save sidebar-collapsed to localStorage', e)
    }
  }, [])

  const toggleMobile = React.useCallback(() => {
    setIsMobileOpen(prev => !prev)
  }, [])

  const toggleCollapse = React.useCallback(() => {
    handleSetCollapsed(!isCollapsed)
  }, [isCollapsed, handleSetCollapsed])

  // Automatically close mobile sidebar when the route changes
  React.useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevent body scrolling when the mobile sidebar is open
  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isMobileOpen])

  // Handle Escape key to close mobile sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileOpen])

  const value = React.useMemo(() => ({
    isMobileOpen,
    setIsMobileOpen,
    isCollapsed,
    setIsCollapsed: handleSetCollapsed,
    toggleMobile,
    toggleCollapse
  }), [isMobileOpen, isCollapsed, handleSetCollapsed, toggleMobile, toggleCollapse])

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
