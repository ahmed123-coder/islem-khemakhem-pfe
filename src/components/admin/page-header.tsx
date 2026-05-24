'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  locale: string
  title: string
  description?: string
  breadcrumbs: Breadcrumb[]
  primaryAction?: {
    label: string
    onClick?: () => void
    href?: string
    icon?: React.ElementType
  }
}

export function PageHeader({ 
  locale,
  title, 
  description, 
  breadcrumbs, 
  primaryAction 
}: PageHeaderProps) {
  return (
    <div className="space-y-6 mb-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        <Link href={`/${locale}/admin`} className="hover:text-blue-600 transition-colors">Root</Link>
        {breadcrumbs.map((bc, index) => (
          <React.Fragment key={bc.label}>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            {bc.href ? (
              <Link href={bc.href} className="hover:text-blue-600 transition-colors">
                {bc.label}
              </Link>
            ) : (
              <span className={cn(index === breadcrumbs.length - 1 ? "text-blue-600" : "")}>
                {bc.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Title & Action */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-slate-500 font-medium mt-1">{description}</p>
          )}
        </div>
        {primaryAction && (
          <div className="flex items-center gap-3">
            {primaryAction.href ? (
              <Link href={primaryAction.href}>
                <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold text-xs px-6 py-5 h-auto transition-all active:scale-95">
                  {primaryAction.icon ? <primaryAction.icon className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {primaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={primaryAction.onClick}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold text-xs px-6 py-5 h-auto transition-all active:scale-95"
              >
                {primaryAction.icon ? <primaryAction.icon className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
