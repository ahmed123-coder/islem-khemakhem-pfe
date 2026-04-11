'use client'

import * as React from 'react'
import { 
  Pencil, 
  Trash2, 
  UserPlus, 
  MoreHorizontal, 
  ShieldCheck, 
  ShieldAlert,
  Mail,
  Award,
  FileText,
  Star
} from 'lucide-react'
import { StandardPage } from '@/components/admin/standard-page'
import { DataTableContainer } from '@/components/admin/data-table-container'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface Consultant {
  id: string
  email: string
  name: string
  specialty: string | null
  hourlyRate: string | null
  bio: string | null
  isActive: boolean
  createdAt: string
  certifications: string[]
  services: { id: string; name: string }[]
  _count: { orders: number; missions: number }
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = React.useState<Consultant[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/consultants')
      const data = await res.json()
      setConsultants(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      header: 'Expert',
      accessor: (c: Consultant) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{c.name}</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600/80 bg-blue-50 px-2 py-0.5 rounded w-fit mt-1">
            {c.specialty || 'Generalist'}
          </span>
        </div>
      ),
    },
    {
      header: 'Stats',
      accessor: (c: Consultant) => (
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 leading-none">{c._count.missions}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missions</span>
          </div>
          <div className="flex flex-col border-l border-slate-100 pl-4">
            <span className="text-lg font-black text-slate-900 leading-none">{c._count.orders}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Specializations',
      accessor: (c: Consultant) => (
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {c.services.length > 0 ? (
            c.services.map(s => (
              <Badge key={s.id} variant="outline" className="rounded-lg border-slate-100 text-[9px] font-bold uppercase tracking-tight py-0">
                {s.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No services linked</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (c: Consultant) => (
        <Badge 
          className={cn(
            "rounded-lg px-2.5 py-1 border-none font-bold text-[10px] uppercase tracking-wider",
            c.isActive 
              ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100" 
              : "bg-slate-100 text-slate-400"
          )}
        >
          {c.isActive ? (
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Active
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              Inactive
            </div>
          )}
        </Badge>
      ),
    },
    {
      header: 'Documents',
      accessor: (c: Consultant) => (
        <div className="flex gap-2">
          {c.certifications.length > 0 && (
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600" title="Certifications Available">
              <Award className="w-4 h-4" />
            </div>
          )}
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
            <FileText className="w-4 h-4" />
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: "text-right",
      accessor: (c: Consultant) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-slate-100">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Expert Settings</DropdownMenuLabel>
              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600">
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600">
                <Star className="w-4 h-4 mr-2" />
                Feature on Home
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Expert
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <StandardPage
      title="Experts Management"
      description="Manage your network of consultants, their specializations, and availability."
      breadcrumbs={[{ label: 'System' }, { label: 'Consultants' }]}
      primaryAction={{
        label: 'Invite Expert',
        icon: UserPlus,
        onClick: () => console.log('Invite expert clicked')
      }}
    >
      <DataTableContainer
        columns={columns}
        data={consultants}
        isLoading={loading}
      />
    </StandardPage>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
