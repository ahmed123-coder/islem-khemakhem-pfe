'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { 
  Pencil, 
  Trash2, 
  UserPlus, 
  MoreHorizontal, 
  ShieldCheck, 
  ShieldAlert,
  Mail,
  Phone,
  Award,
  FileText,
  Star,
  Eye,
  EyeOff,
  Search,
  X,
  Plus,
  ArrowRight,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Info,
  DollarSign,
  UserX,
  UserCheck,
  Image,
  Upload,
  Loader2
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
import { format } from 'date-fns'

interface Consultant {
  id: string
  email: string
  name: string
  firstName: string | null
  phone: string | null
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
  const { locale } = useParams()
  const t = useTranslations('adminPage.consultants')
  const commonT = useTranslations('common')
  const [consultants, setConsultants] = React.useState<Consultant[]>([])
  const [loading, setLoading] = React.useState(true)
  const [services, setServices] = React.useState<Service[]>([])
  const [search, setSearch] = React.useState('')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Consultant | null>(null)
  const [form, setForm] = React.useState<Partial<Consultant & { password?: string; serviceIds?: string[] }>>({ serviceIds: [] })
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  // Detail drawer state
  const [detailConsultant, setDetailConsultant] = React.useState<Consultant | null>(null)

  // File upload state
  const [cvFile, setCvFile] = React.useState<File | null>(null)
  const [certFiles, setCertFiles] = React.useState<File[]>([])
  const cvRef = React.useRef<HTMLInputElement>(null)
  const certRef = React.useRef<HTMLInputElement>(null)

  const fetchServices = React.useCallback(async () => {
    try {
      const res = await fetch('/api/services')
      const result = await res.json()
      const data = result.data || result
      setServices(Array.isArray(data) ? data : [])
    } catch (e) {}
  }, [])

  const fetchConsultants = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/consultants')
      const result = await res.json()
      const data = result.data || result
      if (!Array.isArray(data)) {
        setError(result.error || result.message || 'Erreur de chargement')
        setConsultants([])
      } else {
        setConsultants(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { 
    fetchConsultants()
    fetchServices()

    // Listen for real-time REGISTRATION notifications to auto-refresh the list
    const handleNotification = (e: any) => {
      const data = e.detail
      if (data && data.type === 'REGISTRATION') {
        fetchConsultants()
      }
    }

    window.addEventListener('notification', handleNotification)
    return () => {
      window.removeEventListener('notification', handleNotification)
    }
  }, [fetchConsultants, fetchServices])

  const handleOpenCreate = () => {
    setEditItem(null)
    setForm({ serviceIds: [], isActive: true, certifications: [] })
    setCvFile(null)
    setCertFiles([])
    setError('')
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (c: Consultant) => {
    setEditItem(c)
    setForm({ ...c, serviceIds: c.services.map(s => s.id), certifications: c.certifications || [] })
    setCvFile(null)
    setCertFiles([])
    setError('')
    setIsDialogOpen(true)
  }

  // Upload a single file to Cloudinary via /api/upload/document
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/upload/document', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const { url } = await res.json()
    return url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // 1. Upload CV if a new file was selected
      let cvUrl = form.cvUrl || null
      if (cvFile) {
        cvUrl = await uploadFile(cvFile, 'consultant-cvs')
      }

      // 2. Upload new certification files
      const newCertUrls = await Promise.all(
        certFiles.map(f => uploadFile(f, 'consultant-certs'))
      )
      // Merge existing certifications (kept) + newly uploaded
      const allCertifications = [...(form.certifications || []), ...newCertUrls]

      // 3. Build request body
      const method = editItem ? 'PUT' : 'POST'
      const body = editItem 
        ? { id: editItem.id, ...form, cvUrl, certifications: allCertifications }
        : { ...form, cvUrl, certifications: allCertifications }

      const res = await fetch('/api/admin/consultants', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, serviceIds: form.serviceIds || [] })
      })

      if (res.ok) {
        setIsDialogOpen(false)
        fetchConsultants()
      } else {
        const d = await res.json()
        setError(d.details ? `${d.error}: ${d.details}` : (d.error || 'Operation failed'))
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    // Note : cette action désactive le consultant (soft delete) plutôt que de le
    // supprimer définitivement, pour préserver l'historique des commandes/missions.
    if (!confirm("Désactiver ce consultant ? Son historique sera conservé, mais il ne sera plus visible côté clients.")) return
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
    let fixed = url

    // Cloudinary stocke parfois les fichiers en resource_type 'raw' SANS extension
    // (ex: .../consultant-cvs/xyafhb8kar1ja0ziqphc) — sans extension, le navigateur
    // ne sait pas quel type de fichier ouvrir → "page impossible".
    const hasExtension = /\.[a-z0-9]{2,4}$/i.test(url)

    if (url.includes('/raw/upload/')) {
      if (!hasExtension) {
        // Pas d'extension : on force l'affichage en PDF par défaut
        // (cas le plus courant pour un CV) en ajoutant fl_inline + .pdf
        fixed = url.replace('/raw/upload/', '/raw/upload/fl_inline/') + '.pdf'
      } else {
        fixed = url.replace('/raw/upload/', '/raw/upload/fl_inline/')
      }
    } else if (url.includes('/image/upload/') && url.endsWith('.pdf')) {
      fixed = url.replace('/image/upload/', '/image/upload/fl_inline/')
    }

    window.open(fixed, '_blank')
  }

  const filtered = consultants.filter(c =>
    [c.name, c.firstName, c.email, c.specialty, c.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  // Remove an existing certification URL (when editing)
  const removeCertification = (index: number) => {
    const certs = [...(form.certifications || [])]
    certs.splice(index, 1)
    setForm({ ...form, certifications: certs })
  }

  const columns = [
    {
      header: t("columns.expert"),
      accessor: (c: Consultant) => (
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 shadow-sm border border-blue-100/50 overflow-hidden">
             {c.imageUrl ? (
               <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
             ) : (
               c.firstName?.[0] || c.name[0]
             )}
           </div>
           <div className="flex flex-col">
            <span className="font-bold text-slate-900 leading-tight">{[c.firstName, c.name].filter(Boolean).join(' ')}</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600/80 mt-0.5">
              {c.specialty || 'Generalist'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("columns.contact"),
      accessor: (c: Consultant) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 truncate max-w-[160px]">{c.email}</span>
          </div>
          {c.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-500">{c.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: t("columns.engagements"),
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
      header: t("columns.status"),
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
          {c.isActive ? (
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Active Node
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              Suspended
            </div>
          )}
        </button>
      ),
    },
  {
    header: t("columns.library"),
    accessor: (c: Consultant) => (
      <div className="flex gap-2">
        {c.cvUrl && (
          <button 
            onClick={() => openFile(c.cvUrl!)} 
            className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-all hover:bg-blue-100 hover:scale-105 shadow-sm group relative"
            title="View CV"
          >
            <FileText className="w-4 h-4" />
          </button>
        )}
        {c.certifications.length > 0 && (
          <div className="flex -space-x-3">
            {c.certifications.slice(0, 3).map((cert, i) => (
              <button 
                key={i}
                onClick={() => openFile(cert)}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110 hover:z-10 shadow-sm border-2 border-white",
                  i === 0 ? "bg-purple-50 text-purple-600" : i === 1 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                )}
                title={`View Certificate ${i + 1}`}
              >
                <Award className="w-4 h-4" />
              </button>
            ))}
            {c.certifications.length > 3 && (
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border-2 border-white shadow-sm">
                +{c.certifications.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    ),
  },
    {
      header: t("columns.actions"),
      className: "text-right",
      accessor: (c: Consultant) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-blue-50 hover:text-blue-600" onClick={() => setDetailConsultant(c)}>
            <Info className="w-4 h-4" />
          </Button>
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
              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              <DropdownMenuItem 
                onClick={() => toggleActive(c)}
                className="rounded-xl px-3 py-2.5 cursor-pointer transition-colors font-bold text-sm"
              >
                {c.isActive ? (
                  <>
                    <UserX className="w-4 h-4 mr-3 text-red-500" />
                    Suspend Access
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-3 text-emerald-500" />
                    Restore Node
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(c.id)}
                className="rounded-xl px-3 py-2.5 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-500 font-bold text-sm text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Désactiver le consultant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  // Detail info rows helper
  const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-none">
      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</span>
        <span className="text-sm font-bold text-slate-800 break-words">{value || '—'}</span>
      </div>
    </div>
  )

  return (
    <StandardPage
      locale={locale}
      title={t("title")}
      description={t("description", { count: consultants.length })}
      breadcrumbs={[{ label: t("breadcrumbs.system") }, { label: t("breadcrumbs.consultants") }]}
      primaryAction={{
        label: t("registerNew"),
        icon: UserPlus,
        onClick: handleOpenCreate
      }}
    >
      <div className="space-y-8">
        {error && !isDialogOpen && <div className="p-4 bg-red-50 text-red-600 rounded-[20px] font-bold text-sm border border-red-100">{error}</div>}
        
        <div className="relative max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder={t("search")} 
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

      {/* ── Detail Drawer ── */}
      <Dialog open={!!detailConsultant} onOpenChange={() => setDetailConsultant(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-white rounded-[40px] shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/40">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 text-white text-xl font-black overflow-hidden">
                {detailConsultant?.imageUrl ? (
                  <img src={detailConsultant.imageUrl} alt={detailConsultant.name} className="w-full h-full object-cover" />
                ) : (
                  detailConsultant?.firstName?.[0] || detailConsultant?.name?.[0] || 'C'
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900 leading-none mb-1">
                  {[detailConsultant?.firstName, detailConsultant?.name].filter(Boolean).join(' ') || 'Consultant'}
                </DialogTitle>
                <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">
                  {detailConsultant?.specialty || 'Generalist'} • {detailConsultant?.isActive ? '🟢 Active' : '🔴 Inactive'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="p-8 pt-4 space-y-1">
              <DetailRow icon={Mail} label="Email" value={detailConsultant?.email} />
              <DetailRow icon={UserPlus} label="First Name" value={detailConsultant?.firstName} />
              <DetailRow icon={UserPlus} label="Last Name" value={detailConsultant?.name} />
              <DetailRow icon={Phone} label="Phone" value={detailConsultant?.phone} />
              <DetailRow icon={Briefcase} label="Specialty" value={detailConsultant?.specialty} />
              <DetailRow icon={DollarSign} label="Hourly Rate" value={detailConsultant?.hourlyRate ? `${detailConsultant.hourlyRate} DT/h` : null} />
              <DetailRow icon={FileText} label="Bio" value={detailConsultant?.bio} />
              <DetailRow icon={Image} label="Image URL" value={detailConsultant?.imageUrl} />
              <DetailRow icon={Calendar} label="Registered" value={detailConsultant ? format(new Date(detailConsultant.createdAt), 'PPP') : null} />
              <DetailRow icon={Calendar} label="Last Updated" value={detailConsultant ? format(new Date(detailConsultant.updatedAt), 'PPP') : null} />

              {/* Services */}
              {detailConsultant && detailConsultant.services.length > 0 && (
                <div className="pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block mb-3">Assigned Services</span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailConsultant.services.map(s => (
                      <Badge key={s.id} variant="outline" className="rounded-lg border-blue-100 bg-blue-50/50 text-blue-600 text-[9px] font-bold uppercase tracking-tight py-0.5">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CV */}
              {detailConsultant?.cvUrl && (
                <div className="pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block mb-3">CV / Resume</span>
                  <button
                    onClick={() => openFile(detailConsultant.cvUrl!)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors w-full"
                  >
                    <FileText className="w-4 h-4" />
                    View CV / Resume
                  </button>
                </div>
              )}

              {/* Certifications */}
              {detailConsultant && detailConsultant.certifications.length > 0 && (
                <div className="pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block mb-3">Certifications</span>
                  <div className="space-y-2">
                    {detailConsultant.certifications.map((cert, i) => (
                      <button
                        key={i}
                        onClick={() => openFile(cert)}
                        className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/50 text-purple-600 text-xs font-bold hover:bg-purple-100 transition-colors w-full text-left"
                      >
                        <Award className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Certificate {i + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement stats */}
              {detailConsultant && (
                <div className="pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block mb-3">Engagement Stats</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50/80 text-center">
                      <span className="text-lg font-black text-slate-900 block">{detailConsultant._count.missions}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Missions</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50/80 text-center">
                      <span className="text-lg font-black text-slate-900 block">{detailConsultant._count.orders}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Orders</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50/80 text-center">
                      <span className="text-lg font-black text-slate-900 block">{detailConsultant._count.reservations}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sessions</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 pt-0 flex gap-2">
            <Button
              onClick={() => { setDetailConsultant(null); if (detailConsultant) handleOpenEdit(detailConsultant); }}
              className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black h-12 shadow-lg shadow-blue-100 transition-all hover:scale-[1.02]"
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => setDetailConsultant(null)}
              className="rounded-2xl h-12 font-bold border-slate-200"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Form Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!submitting) setIsDialogOpen(open) }}>
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
            <form onSubmit={handleSubmit} id="consultant-form" className="p-8 space-y-8">
              {error && isDialogOpen && (
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</Label>
                  <Input value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</Label>
                  <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" placeholder="Doe" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                  <Input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} required className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone</Label>
                  <Input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" placeholder="+216 XX XXX XXX" />
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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hourly Rate (DT)</Label>
                  <Input type="number" step="0.01" value={form.hourlyRate || ''} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Avatar Content URL</Label>
                  <Input value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold" />
                </div>

                {/* ── CV Upload (like register page) ── */}
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> CV / Resume <span className="text-slate-300 font-normal normal-case">(PDF, DOC)</span>
                  </Label>
                  
                  {/* Show existing CV if editing */}
                  {editItem && form.cvUrl && !cvFile && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-100/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-blue-600 truncate">Current CV uploaded</span>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button type="button" onClick={() => openFile(form.cvUrl!)} className="text-[10px] font-bold text-blue-600 bg-blue-100 rounded-lg px-2 py-1 hover:bg-blue-200 transition-colors">View</button>
                        <button type="button" onClick={() => setForm({ ...form, cvUrl: null })} className="text-[10px] font-bold text-red-500 bg-red-50 rounded-lg px-2 py-1 hover:bg-red-100 transition-colors">Remove</button>
                      </div>
                    </div>
                  )}

                  <div 
                    onClick={() => cvRef.current?.click()} 
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                  >
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-bold text-blue-600">{cvFile.name}</span>
                        <button type="button" onClick={e => { e.stopPropagation(); setCvFile(null) }} className="text-red-400 hover:text-red-600 ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        <span className="text-sm text-slate-400 group-hover:text-blue-500 font-medium transition-colors">
                          {editItem && form.cvUrl ? 'Click to replace CV' : 'Click to upload CV'}
                        </span>
                        <span className="text-[10px] text-slate-300">PDF, DOC, DOCX</span>
                      </div>
                    )}
                  </div>
                  <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files?.[0] || null)} />
                </div>

                {/* ── Certifications Upload (like register page) ── */}
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5" /> Certifications <span className="text-slate-300 font-normal normal-case">(facultatif — PDF, JPG, PNG)</span>
                  </Label>
                  
                  {/* Show existing certifications if editing */}
                  {(form.certifications || []).length > 0 && (
                    <div className="space-y-1.5">
                      {(form.certifications || []).map((cert, i) => (
                        <div key={`existing-${i}`} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <Award className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span className="text-xs font-bold text-purple-600 truncate">Certificate {i + 1}</span>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button type="button" onClick={() => openFile(cert)} className="text-[10px] font-bold text-purple-600 bg-purple-100 rounded-lg px-2 py-1 hover:bg-purple-200 transition-colors">View</button>
                            <button type="button" onClick={() => removeCertification(i)} className="text-[10px] font-bold text-red-500 bg-red-50 rounded-lg px-2 py-1 hover:bg-red-100 transition-colors">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show staged new files */}
                  {certFiles.length > 0 && (
                    <div className="space-y-1.5">
                      {certFiles.map((f, i) => (
                        <div key={`new-${i}`} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <Upload className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs font-bold text-emerald-600 truncate">{f.name}</span>
                            <Badge className="bg-emerald-100 text-emerald-600 border-none text-[8px] font-bold uppercase">New</Badge>
                          </div>
                          <button type="button" onClick={() => setCertFiles(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div 
                    onClick={() => certRef.current?.click()} 
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all group"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-6 h-6 text-slate-300 group-hover:text-purple-400 transition-colors" />
                      <span className="text-sm text-slate-400 group-hover:text-purple-500 font-medium transition-colors">Click to add certifications</span>
                      <span className="text-[10px] text-slate-300">PDF, JPG, PNG — Multiple files allowed</span>
                    </div>
                  </div>
                  <input ref={certRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={e => { setCertFiles(prev => [...prev, ...Array.from(e.target.files || [])]); if (certRef.current) certRef.current.value = '' }} />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Expert Narrative (Bio)</Label>
                  <Textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} className="rounded-3xl bg-slate-50 border-transparent focus:bg-white transition-all font-medium" />
                </div>

                <div className="col-span-2 p-6 rounded-[32px] bg-slate-50/50 border border-slate-100">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                    <Award className="w-3.5 h-3.5" /> Service Assignment
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
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={submitting} className="rounded-2xl font-bold text-slate-400 px-6">Discard</Button>
            <Button 
               type="submit"
               form="consultant-form"
               disabled={submitting}
               className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black italic px-8 h-12 shadow-xl shadow-blue-100 transition-all hover:scale-105"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
              ) : (
                <>{editItem ? 'Finalize Modification' : 'Deploy Protocol'} <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardPage>
  )
}