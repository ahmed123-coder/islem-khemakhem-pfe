'use client'

import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ElementType
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon = HelpCircle,
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-[32px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
      <div className="w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">
        {description}
      </p>
      {action && (
        <Button 
          onClick={action.onClick}
          variant="outline"
          className="rounded-xl border-slate-200 font-bold text-xs"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
