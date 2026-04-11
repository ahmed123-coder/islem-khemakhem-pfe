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
  Phone,
  Calendar
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

interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
  _count: { orders: number; reservations: number }
}

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.filter((u: User) => u.role === 'CLIENT'))
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      header: 'Client',
      accessor: (user: User) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{user.name || 'N/A'}</span>
          <span className="text-xs text-slate-400 font-medium">{user.email}</span>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: (user: User) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Mail className="w-3.5 h-3.5" />
            {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="w-3.5 h-3.5" />
              {user.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Activity',
      accessor: (user: User) => (
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 leading-none">{user._count.orders}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Orders</span>
          </div>
          <div className="flex flex-col border-l border-slate-100 pl-4">
            <span className="text-lg font-black text-slate-900 leading-none">{user._count.reservations}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visits</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (user: User) => (
        <Badge 
          className={cn(
            "rounded-lg px-2.5 py-1 border-none font-bold text-[10px] uppercase tracking-wider",
            user.isActive 
              ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100" 
              : "bg-slate-100 text-slate-400"
          )}
        >
          {user.isActive ? (
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Active
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              Suspended
            </div>
          )}
        </Badge>
      ),
    },
    {
      header: 'Joined',
      accessor: (user: User) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-slate-300" />
          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: "text-right",
      accessor: (user: User) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-slate-100">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Client Actions</DropdownMenuLabel>
              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600">
                <Pencil className="w-4 h-4 mr-2" />
                Edit Account
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600">
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <StandardPage
      title="User Management"
      description="View and manage all registered clients and their platform activity."
      breadcrumbs={[{ label: 'System' }, { label: 'Users' }]}
      primaryAction={{
        label: 'Register Client',
        icon: UserPlus,
        onClick: () => console.log('Add user clicked')
      }}
    >
      <DataTableContainer
        columns={columns}
        data={users}
        isLoading={loading}
      />
    </StandardPage>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
