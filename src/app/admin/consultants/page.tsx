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
  Star,
  Eye,
  EyeOff,
  Search,
  X,
  Plus,
  ArrowRight
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
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Consultant {
  id: string
  email: string
  name: string
  specialty: string | null
  hourlyRate: string | null
  bio: string | null
  imageUrl: string | null
  cvUrl: string | null
  certifications: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  services: { id: string; name: string }[]
  _count: { orders: number; reservations: number; missions: number }
}

interface Service {
  id: string
  name: string
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = React.useState<Consultant[]>([])
  const [loading, setLoading] = React.useState(true)
  const [services, setServices] = React.useState<Service[]>([])
  const [search, setSearch] = React.useState('')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Consultant | null>(null)
  const [form, setForm] = React.useState<Partial<Consultant & { password?: string; serviceIds?: string[] }>>({ serviceIds: [] })
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => { 
    fetchConsultants()
    fetchServices() 
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (e) {}
  }

  const fetchConsultants = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/consultants')
      const data = await res.json()
      if (!Array.isArray(data)) {
        setError(data.error || 'Erreur de chargement')
        setConsultants([])
      } else {
        setConsultants(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditItem(null)
    setForm({ serviceIds: [], isActive: true })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (c: Consultant) => {
    setEditItem(c)
    setForm({ ...c, serviceIds: c.services.map(s => s.id) })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    const res = await fetch('/api/admin/consultants', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, serviceIds: form.serviceIds || [] })
    })
    if (res.ok) {
      setIsDialogOpen(false)
      fetchConsultants()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce consultant ?')) return
    const res = await fetch(`/api/admin/consultants/${id}`, { method: 'DELETE' })
    if (res.ok) fetchConsultants()
  }

  const toggleActive = async (consultant: Consultant) => {
    const res = await fetch('/api/admin/consultants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: consultant.id, isActive: !consultant.isActive })
    })
    if (res.ok) fetchConsultants()
  }

  const openFile = (url: string) => {
    // Utility for opening files with fl_inline if needed
    let fixed = url
    if (url.includes('/raw/upload/') && !url.match(/\.[a-z]+$/i)) {
      fixed = url.replace('/raw/upload/', '/raw/upload/fl_inline/')
    } else if (url.includes('/image/upload/') && url.endsWith('.pdf')) {
      fixed = url.replace('/image/upload/', '/image/upload/fl_inline/')
    }
    window.open(fixed, '_blank')
  }

  const filtered = consultants.filter(c =>
    [c.name, c.email, c.specialty].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const columns = [
    {
      header: 'Expert',
      accessor: (c: Consultant) => (
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 shadow-sm border border-blue-100/50">
             {c.name[0]}
           </div>
           <div className="flex flex-col">
            <span className="font-bold text-slate-900 leading-tight">{c.name}</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600/80 mt-0.5">
              {c.specialty || 'Generalist'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Engagements',
      accessor: (c: Consultant) => (
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 leading-none">{c._count?.missions || 0}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missions</span>
          </div>
          <div className="flex flex-col border-l border-slate-100 pl-4">
            <span className="text-lg font-black text-slate-900 leading-none">{c._count?.reservations || 0}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessions</span>
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
            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (c: Consultant) => (
        <button 
          onClick={() => toggleActive(c)}
          className={cn(
            "rounded-xl px-3 py-1.5 border-none font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95",
            c.isActive 
              ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50" 
              : "bg-slate-100 text-slate-400"
          )}
        >
          {c.isActive ? 'Active Node' : 'Suspended'}
        </button>
      ),
    },
    {
      header: 'Library',
      accessor: (c: Consultant) => (
        <div className="flex gap-2">
          {c.cvUrl && (
            <button 
              onClick={() => openFile(c.cvUrl!)} 
              className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-all hover:bg-blue-100 hover:scale-105 shadow-sm"
              title="View CV"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}
          {c.certifications.length > 0 && (
            <button 
              onClick={() => openFile(c.certifications[0])}
              className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 transition-all hover:bg-purple-100 hover:scale-105 shadow-sm"
              title="View Certificates"
            >
              <Award className="w-4 h-4" />
            </button>
          )}
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
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100 transition-all hover:rotate-90">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-[24px] shadow-2xl border-slate-100 backdrop-blur-xl bg-white/90">
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expert Protocols</DropdownMenuLabel>
              <DropdownMenuItem 
               onClick={() => handleOpenEdit(c)}
               className="rounded-xl px-3 py-2.5 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600 font-bold text-sm"
              >
                <Pencil className="w-4 h-4 mr-3" />
                Modify Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600 font-bold text-sm">
                <Star className="w-4 h-4 mr-3" />
                Elevate to Featured
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              <DropdownMenuItem 
                onClick={() => handleDelete(c.id)}
                className="rounded-xl px-3 py-2.5 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-500 font-bold text-sm"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Dismantle Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <StandardPage
      title="Consultants Engine"
      description={`Oversee your network of ${consultants.length} elite professional advisors.`}
      breadcrumbs={[{ label: 'System' }, { label: 'Consultants' }]}
      primaryAction={{
        label: 'Register New Expert',
        icon: UserPlus,
        onClick: handleOpenCreate
      }}
    >
      <div className="space-y-8">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-[20px] font-bold text-sm border border-red-100">{error}</div>}
        
        <div className="relative max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder="Search advisors by name, specialty, or email..." 
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

      {/* Modern Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-white rounded-[40px] shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-slate-50/50 border-b border-white">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100 text-white">
                 <UserPlus className="w-6 h-6" />
               </div>
               <div>
                 <DialogTitle className="text-2xl font-black text-slate-900 leading-none mb-1">
                   {editItem ? 'Refine Consultant' : 'Onboard New Expert'}
                 </DialogTitle>
                 <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">
                   {editItem ? `ID: ${editItem.id.slice(0, 8)}...` : 'Strategic Resource Creation'}
                 </DialogDescription>
               </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</Label>
                  <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct Email</Label>
                  <Input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} required className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
                </div>
                {!editItem && (
                  <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Protocol (Password)</Label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} required className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prime Specialty</Label>
                  <Input value={form.specialty || ''} onChange={e => setForm({ ...form, specialty: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hourly Compensation ($/€)</Label>
                  <Input type="number" step="0.01" value={form.hourlyRate || ''} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Avatar Content URL</Label>
                  <Input value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Expert Narrative (Bio)</Label>
                  <Textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} className="rounded-3xl bg-slate-50 border-transparent focus:bg-white transition-all font-medium" />
                </div>

                <div className="col-span-2 p-6 rounded-[32px] bg-slate-50/50 border border-slate-100">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                    <Award className="w-3.5 h-3.5" /> Logical Service Assignment
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map(service => (
                      <div key={service.id} className="flex items-center space-x-3 p-2 rounded-xl bg-white border border-slate-100/50 shadow-sm">
                        <Checkbox 
                          id={service.id} 
                          checked={form.serviceIds?.includes(service.id)} 
                          onCheckedChange={(checked) => {
                            const ids = form.serviceIds || []
                            setForm({ ...form, serviceIds: checked ? [...ids, service.id] : ids.filter(id => id !== service.id) })
                          }} 
                        />
                        <label htmlFor={service.id} className="text-xs font-bold text-slate-600 cursor-pointer">{service.name}</label>
                      </div>
                    ))}
                    {services.length === 0 && <p className="text-[10px] font-bold text-slate-300 italic">No services defined</p>}
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                  <Checkbox 
                    id="isActive" 
                    checked={form.isActive ?? true} 
                    onCheckedChange={(c) => setForm({ ...form, isActive: c as boolean })} 
                  />
                  <Label htmlFor="isActive" className="text-xs font-black uppercase tracking-widest text-emerald-700 cursor-pointer">Set as Active Expert Node</Label>
                </div>
              </div>
            </form>
          </ScrollArea>

          <DialogFooter className="p-8 bg-slate-50/50 border-t border-white">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl font-bold text-slate-400 px-6">Discard</Button>
            <Button 
               onClick={handleSubmit}
               className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black italic px-8 h-12 shadow-xl shadow-blue-100 transition-all hover:scale-105"
            >
              {editItem ? 'Finalize Modification' : 'Deploy Protocol'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardPage>
  )
}
