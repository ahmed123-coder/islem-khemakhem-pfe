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
  Calendar,
  Eye,
  EyeOff,
  ShoppingCart,
  X,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  UserX,
  UserCheck
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
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface OrderSummary {
  id: string
  status: string
  createdAt: string
  serviceTier: {
    tierType: string
    price: number
    service: { name: string }
  }
}

interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { orders: number; reservations: number }
  orders: OrderSummary[]
}

interface Service {
  id: string
  name: string
}

interface Tier {
  id: string
  tierType: string
  price: number
  description: string | null
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED: 'bg-red-100 text-red-500 border-red-200',
}

const COMPLETED_ORDER_THRESHOLD = 3

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [isUserSheetOpen, setIsUserSheetOpen] = React.useState(false)
  const [editUser, setEditUser] = React.useState<User | null>(null)
  const [form, setForm] = React.useState<Partial<User & { password?: string }>>({})
  const [showPassword, setShowPassword] = React.useState(false)

  // Order modal state
  const [orderTarget, setOrderTarget] = React.useState<User | null>(null)
  const [services, setServices] = React.useState<Service[]>([])
  const [selectedService, setSelectedService] = React.useState('')
  const [tiers, setTiers] = React.useState<Tier[]>([])
  const [selectedTier, setSelectedTier] = React.useState('')
  const [orderLoading, setOrderLoading] = React.useState(false)

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

  const handleOpenCreate = () => {
    setEditUser(null)
    setForm({ isActive: true })
    setIsUserSheetOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditUser(user)
    setForm(user)
    setIsUserSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editUser ? 'PUT' : 'POST'
    const body = editUser ? { id: editUser.id, ...form } : form
    const res = await fetch('/api/admin/users', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      setIsUserSheetOpen(false)
      fetchUsers()
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) fetchUsers()
  }

  const toggleActive = async (user: User) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, isActive: !user.isActive })
    })
    if (res.ok) fetchUsers()
  }

  const openOrderModal = async (user: User) => {
    setOrderTarget(user)
    setSelectedService('')
    setSelectedTier('')
    setTiers([])
    const res = await fetch('/api/admin/services')
    if (res.ok) setServices(await res.json())
  }

  const handleServiceChange = async (serviceId: string) => {
    setSelectedService(serviceId)
    setSelectedTier('')
    if (!serviceId) return setTiers([])
    const res = await fetch(`/api/admin/services/tiers?serviceId=${serviceId}`)
    if (res.ok) setTiers(await res.json())
  }

  const handleCreateOrder = async () => {
    if (!orderTarget || !selectedTier) return
    setOrderLoading(true)
    const res = await fetch('/api/admin/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: orderTarget.id, serviceTierId: selectedTier })
    })
    setOrderLoading(false)
    if (res.ok) {
      setOrderTarget(null)
      fetchUsers()
    }
  }

  const filtered = users.filter(u =>
    [u.name, u.email, u.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const completedCount = (u: User) => u.orders?.filter(o => o.status === 'COMPLETED').length || 0
  const isHighValue = (u: User) => completedCount(u) >= COMPLETED_ORDER_THRESHOLD

  const columns = [
    {
      header: 'Client Portfolio',
      accessor: (user: User) => (
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 shadow-sm border border-blue-100/50">
             {user.name?.[0] || 'C'}
           </div>
           <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 leading-tight">{user.name || 'Anonymous'}</span>
              {isHighValue(user) && (
                <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[8px] uppercase tracking-tighter shadow-sm">
                  VIP • {completedCount(user)} Done
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
              {user.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Engagement Metrics',
      accessor: (user: User) => (
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 leading-none">{user._count.orders}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
          </div>
          <div className="flex flex-col border-l border-slate-100 pl-4">
            <span className="text-lg font-black text-slate-900 leading-none">{user._count.reservations}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Visits</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Account Vitality',
      accessor: (user: User) => (
        <button 
          onClick={() => toggleActive(user)}
          className={cn(
            "rounded-xl px-3 py-1.5 border-none font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95",
            user.isActive 
              ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50" 
              : "bg-slate-100 text-slate-400"
          )}
        >
          {user.isActive ? (
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Pulse Active
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              Locked
            </div>
          )}
        </button>
      ),
    },
    {
      header: 'Active Streams',
      accessor: (user: User) => {
        const active = user.orders?.filter(o => o.status === 'ACTIVE' || o.status === 'PENDING') || []
        return (
          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
            {active.length > 0 ? (
              active.map(o => (
                <Badge key={o.id} className="rounded-lg bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase tracking-tight py-0.5">
                  {o.serviceTier.service.name.split(' ')[0]}
                </Badge>
              ))
            ) : (
              <span className="text-[10px] font-bold text-slate-200 uppercase">Idle</span>
            )}
          </div>
        )
      },
    },
    {
      header: 'Registration',
      accessor: (user: User) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[11px] font-bold uppercase tracking-tighter">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
    {
      header: 'Protocols',
      className: "text-right",
      accessor: (user: User) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-[24px] shadow-2xl border-slate-100 backdrop-blur-xl bg-white/90">
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Override</DropdownMenuLabel>
              <DropdownMenuItem 
               onClick={() => openOrderModal(user)}
               className="rounded-xl px-3 py-2.5 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600 font-bold text-sm"
              >
                <ShoppingCart className="w-4 h-4 mr-3" />
                Initialize Order
              </DropdownMenuItem>
              <DropdownMenuItem 
               onClick={() => handleOpenEdit(user)}
               className="rounded-xl px-3 py-2.5 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600 font-bold text-sm"
              >
                <Pencil className="w-4 h-4 mr-3" />
                Modify Account
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              <DropdownMenuItem 
                onClick={() => toggleActive(user)}
                className="rounded-xl px-3 py-2.5 cursor-pointer transition-colors font-bold text-sm"
              >
                {user.isActive ? (
                  <>
                    <UserX className="w-4 h-4 mr-3 text-red-500" />
                    Suspend Access
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-3 text-emerald-500" />
                    Restore Pulse
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteUser(user.id)}
                className="rounded-xl px-3 py-2.5 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-500 font-bold text-sm text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Terminate Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <StandardPage
      title="Client Command"
      description={`Oversee your mission engagement with ${users.length} registered strategic partners.`}
      breadcrumbs={[{ label: 'System' }, { label: 'Users' }]}
      primaryAction={{
        label: 'Register New Client',
        icon: UserPlus,
        onClick: handleOpenCreate
      }}
    >
      <div className="space-y-8">
        <div className="relative max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder="Search partners by name, email, or digital ID..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="h-14 pl-12 pr-4 rounded-[20px] border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm focus:ring-4 focus:ring-blue-600/5 transition-all font-medium"
          />
        </div>

        <DataTableContainer
          columns={columns}
          data={filtered}
          isLoading={loading}
        />
      </div>

      {/* User Form Dialog */}
      <Dialog open={isUserSheetOpen} onOpenChange={setIsUserSheetOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-white rounded-[40px] shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-slate-50/50 border-white">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100 text-white">
                 <UserPlus className="w-6 h-6" />
               </div>
               <div>
                 <DialogTitle className="text-2xl font-black text-slate-900 leading-none mb-1">
                   {editUser ? 'Refine Account' : 'New Identity'}
                 </DialogTitle>
                 <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">
                    Secure Client Onboarding
                 </DialogDescription>
               </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Name</Label>
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Endpoint</Label>
              <Input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} required className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Comm Line (Phone)</Label>
              <Input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
            </div>
            {!editUser && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Protocol</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} required className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black italic h-14 shadow-xl shadow-blue-100 transition-all hover:scale-[1.02]">
                {editUser ? 'Update Protocol' : 'Onboard Partner'} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Initialize Order Modal */}
      <Dialog open={!!orderTarget} onOpenChange={() => setOrderTarget(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-white rounded-[40px] shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100 text-white">
                 <ShoppingCart className="w-6 h-6" />
               </div>
               <div>
                 <DialogTitle className="text-2xl font-black text-slate-900 leading-none mb-1"> Initialize Flow </DialogTitle>
                 <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400"> New Acquisition for {orderTarget?.name || orderTarget?.email} </DialogDescription>
               </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Strategic Domain</Label>
                <select
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold text-sm appearance-none outline-none"
                  value={selectedService}
                  onChange={e => handleServiceChange(e.target.value)}
                >
                  <option value="">Choose Domain...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {tiers.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 font-bold">Available Service Tiers</Label>
                  <div className="space-y-2">
                    {tiers.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => setSelectedTier(t.id)}
                        className={cn(
                          "p-4 rounded-[28px] border-2 cursor-pointer transition-all flex items-center justify-between group",
                          selectedTier === t.id 
                            ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100" 
                            : "bg-slate-50 border-transparent hover:bg-slate-100"
                        )}
                      >
                        <div>
                          <p className={cn("text-xs font-black uppercase tracking-widest mb-0.5", selectedTier === t.id ? "text-blue-100" : "text-slate-400")}>{t.tierType}</p>
                          <p className={cn("text-sm font-bold", selectedTier === t.id ? "text-white" : "text-slate-900")}>{t.description || 'Full Access'}</p>
                        </div>
                        <span className={cn("text-lg font-black italic", selectedTier === t.id ? "text-white" : "text-blue-600")}>{Number(t.price).toFixed(0)} <span className="text-[10px]">DT</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                onClick={handleCreateOrder} 
                disabled={!selectedTier || orderLoading} 
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black italic h-14 shadow-xl shadow-emerald-100 transition-all hover:scale-[1.02]"
              >
                {orderLoading ? 'Synthesizing...' : 'Deploy Acquisition'} <Plus className="w-5 h-5 ml-2" />
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </StandardPage>
  )
}
