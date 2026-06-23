'use client'

import * as React from 'react'
import { SidebarProvider } from '@/context/SidebarContext'
import { Toaster } from 'react-hot-toast'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  header: React.ReactNode
  theme?: 'admin' | 'client' | 'consultant'
}

export function DashboardLayout({
  children,
  sidebar,
  header,
  theme = 'admin'
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden">
        {/* Responsive Sidebar */}
        {sidebar}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header */}
          {header}

          {/* Main Scrollable View */}
          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="p-4 md:p-6 lg:p-8 mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
