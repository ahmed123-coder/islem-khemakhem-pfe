'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Settings2, 
  ChevronRight, 
  Search, 
  Layout, 
  Edit3, 
  FolderPlus,
  Save,
  Image as ImageIcon,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronDown,
  X,
  Upload,
  AlertCircle
} from 'lucide-react'
import { StandardPage } from '@/components/admin/standard-page'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"

type Service = { 
  id: string; 
  name: string; 
  description: string; 
  category?: string; 
  icon?: string; 
  image?: string; 
  isActive?: boolean 
}

type Tier = { 
  id: string; 
  serviceId: string; 
  tierType: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ULTIMATE'; 
  price: number; 
  maxMessages: number | null; 
  maxCallDuration: number | null; 
  canSelectConsultant: boolean; 
  description: string | null;
  sessionsConfig?: { duration: number; label: string }[];
}

export default function ServicesCMS() {
  const [services, setServices] = React.useState<Service[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<Partial<Service>>({})
  const [tiers, setTiers] = React.useState<Tier[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isEditing, setIsEditing] = React.useState(false)
  
  // File states
  const [iconFile, setIconFile] = React.useState<File | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  // Tier management state
  const [editTierId, setEditTierId] = React.useState<string | null>(null)
  const [tierForm, setTierForm] = React.useState<Partial<Tier>>({
    tierType: 'BASIC',
    price: 0,
    maxMessages: null,
    maxCallDuration: null,
    canSelectConsultant: false,
    description: '',
    sessionsConfig: []
  })

  React.useEffect(() => { 
    loadServices() 
  }, [])

  React.useEffect(() => {
    if (selectedId) {
      const selected = services.find(s => s.id === selectedId)
      if (selected) {
        setForm(selected)
        loadTiers(selectedId)
      }
      setIconFile(null)
      setImageFile(null)
    } else {
      setForm({})
      setTiers([])
      setIconFile(null)
      setImageFile(null)
    }
  }, [selectedId, services])

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/services')
      if (res.ok) {
        const result = await res.json()
        const data = result.data || result
        setServices(Array.isArray(data) ? data : [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadTiers = async (serviceId: string) => {
    const res = await fetch(`/api/admin/services/tiers?serviceId=${serviceId}`)
    if (res.ok) {
      const result = await res.json()
      const data = result.data || result
      setTiers(Array.isArray(data) ? data : [])
    }
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setIsEditing(true)
  }

  const handleCreateNew = () => {
    setSelectedId(null)
    setForm({})
    setTiers([])
    setIsEditing(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'image') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'icon') setIconFile(file)
      else setImageFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const method = selectedId ? 'PUT' : 'POST'
    
    const formData = new FormData()
    if (selectedId) formData.append('id', selectedId)
    if (form.name) formData.append('name', form.name)
    if (form.description) formData.append('description', form.description)
    if (form.category) formData.append('category', form.category)
    if (form.isActive !== undefined) formData.append('isActive', String(form.isActive))
    
    if (iconFile) formData.append('icon', iconFile)
    if (imageFile) formData.append('image', imageFile)

    try {
      const res = await fetch('/api/admin/services', { method, body: formData })
      if (res.ok) {
        const updatedService = await res.json()
        loadServices()
        if (!selectedId) {
           setSelectedId(updatedService.id)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId || !confirm('Permanently dismantle this service record?')) return
    await fetch(`/api/admin/services?id=${selectedId}`, { method: 'DELETE' })
    setSelectedId(null)
    setIsEditing(false)
    loadServices()
  }

  // Tier CRUD
  const handleAddNewTier = () => {
    setEditTierId('new')
    setTierForm({
      tierType: 'BASIC',
      price: 0,
      maxMessages: null,
      maxCallDuration: null,
      canSelectConsultant: false,
      description: ''
    })
  }

  const handleTierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return

    const method = editTierId && editTierId !== 'new' ? 'PUT' : 'POST'
    const body = editTierId && editTierId !== 'new' 
      ? { ...tierForm, id: editTierId } 
      : { ...tierForm, serviceId: selectedId }
    
    const res = await fetch('/api/admin/services/tiers', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (res.ok) {
      setEditTierId(null)
      loadTiers(selectedId)
    }
  }

  const handleTierDelete = async (id: string) => {
    if (!confirm('Dismantle this pricing tier?')) return
    await fetch(`/api/admin/services/tiers?id=${id}`, { method: 'DELETE' })
    if (selectedId) loadTiers(selectedId)
  }

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <StandardPage
      title="Services Engine"
      description="Design and manage your service portfolio, pricing tiers, and capabilities."
      breadcrumbs={[{ label: 'Content' }, { label: 'Services' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List Pane */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 text-sm placeholder:text-slate-400 transition-all font-medium"
            />
          </div>

          <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
            <button 
              onClick={handleCreateNew}
              className={cn(
                "w-full p-4 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center gap-3 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all group font-bold text-sm",
                !selectedId && isEditing ? "border-blue-600 bg-blue-50/50 text-blue-600 shadow-lg shadow-blue-100/50" : ""
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              Define New Service
            </button>

            {filteredServices.map((service, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={service.id}
              >
                <div 
                  onClick={() => handleSelect(service.id)}
                  className={cn(
                    "relative overflow-hidden p-4 rounded-[28px] border cursor-pointer transition-all duration-300 group",
                    selectedId === service.id 
                      ? "bg-white border-blue-600 shadow-xl shadow-blue-50 ring-4 ring-blue-600/5" 
                      : "bg-white/60 border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-lg"
                  )}
                >
                  <div className="flex gap-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100/50">
                      {service.icon || service.image ? (
                        <img src={service.icon || service.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-slate-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 truncate leading-tight">{service.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                        {service.category || 'Consulting'}
                      </p>
                      <Badge className={cn(
                        "rounded-lg px-2 py-0 border-none text-[8px] font-black uppercase tracking-tight",
                        service.isActive !== false ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {service.isActive !== false ? 'Live' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all",
                    selectedId === service.id ? "text-blue-600 translate-x-1" : "text-slate-200 group-hover:text-slate-400"
                  )} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Editor Pane */}
        <div className="lg:col-span-8 lg:sticky lg:top-24">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-[600px] flex flex-col items-center justify-center text-center p-12 rounded-[40px] border border-dashed border-slate-200 bg-slate-50/50 backdrop-blur-sm"
              >
                <div className="w-24 h-24 rounded-[32px] bg-white flex items-center justify-center shadow-sm mb-6 relative">
                  <div className="absolute -inset-2 bg-blue-50 rounded-[40px] -z-10 animate-pulse" />
                  <Sparkles className="w-10 h-10 text-blue-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Service Selected</h3>
                <p className="text-sm text-slate-500 max-w-xs font-medium mb-8">
                  Pick a service or create a new offering to manage parameters, tiers, and capabilities.
                </p>
                <Button 
                  onClick={handleCreateNew}
                  className="rounded-2xl bg-slate-900 hover:bg-black text-white px-8 h-12 font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-1"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <Card className="rounded-[40px] border-none bg-white/80 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.04)] p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
                  
                  <div className="relative space-y-10">
                    <header className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                          <Settings2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {selectedId ? 'Refine Service' : 'New Offering'}
                          </h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedId ? `SERVICE ID: ${selectedId.slice(0,8)}` : 'Strategic Resource Creation'}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsEditing(false)}
                        className="rounded-xl hover:bg-slate-100"
                      >
                        <X className="w-5 h-5 text-slate-400" />
                      </Button>
                    </header>

                    {/* Form Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Service Identity</label>
                          <Input 
                            value={form.name || ''} 
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Strategic Audit" 
                            className="h-14 rounded-2xl border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm focus:ring-4 focus:ring-blue-600/5 text-base font-bold placeholder:font-medium transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Classification</label>
                          <Input 
                            value={form.category || ''} 
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            placeholder="e.g. Business Strategy" 
                            className="h-14 rounded-2xl border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm focus:ring-4 focus:ring-blue-600/5 text-base font-bold placeholder:font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2 h-full flex flex-col">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Value Proposition (Bio)</label>
                          <Textarea 
                            value={form.description || ''} 
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Explain the service impact..." 
                            className="flex-1 rounded-3xl border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm focus:ring-4 focus:ring-blue-600/5 text-sm font-medium resize-none p-4"
                          />
                        </div>
                      </div>

                      {/* Visual Content: Image Dropzones */}
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-3 block">Digital Assets</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="group relative h-40 rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer overflow-hidden">
                            {(iconFile || form.icon) ? (
                              <img src={iconFile ? URL.createObjectURL(iconFile) : form.icon} className="h-20 object-contain" alt="Icon" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Icon</span>
                              </>
                            )}
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'icon')} className="hidden" />
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-center text-blue-600 uppercase tracking-widest">Change Icon</div>
                          </label>

                          <label className="group relative h-40 rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer overflow-hidden">
                            {(imageFile || form.image) ? (
                              <img src={imageFile ? URL.createObjectURL(imageFile) : form.image} className="h-full w-full object-cover" alt="Hero" />
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hero Image</span>
                              </>
                            )}
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image')} className="hidden" />
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-center text-blue-600 uppercase tracking-widest">Change Cover</div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Tier Management Suite */}
                    <section className="pt-10 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Tier Architecture</h3>
                          <p className="text-xs text-slate-400 font-medium">Configure value packages and resource constraints.</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAddNewTier}
                          className="rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest px-4 h-10 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        >
                          <FolderPlus className="w-4 h-4 mr-2" /> Synthesize Tier
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {/* New/Edit Tier Form inside the list if active */}
                        {editTierId && (
                           <Card className="p-6 rounded-[32px] border-2 border-blue-600 shadow-xl shadow-blue-50 bg-white/50 backdrop-blur-sm mb-6 animate-in slide-in-from-top-4 duration-300">
                             <header className="flex items-center justify-between mb-6">
                               <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                 {editTierId === 'new' ? 'New Implementation' : 'Modify Parameters'}
                               </h4>
                               <Button variant="ghost" size="icon" onClick={() => setEditTierId(null)} className="rounded-xl"><X className="w-4 h-4 text-slate-400" /></Button>
                             </header>
                             
                             <div className="grid grid-cols-2 gap-6 mb-6">
                               <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Class Type</label>
                                 <select 
                                    className="w-full h-12 bg-white rounded-2xl border-slate-100 px-4 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
                                    value={tierForm.tierType}
                                    onChange={e => setTierForm({ ...tierForm, tierType: e.target.value as any })}
                                  >
                                    <option value="BASIC">BASIC</option>
                                    <option value="STANDARD">STANDARD</option>
                                    <option value="PREMIUM">PREMIUM</option>
                                    <option value="ULTIMATE">ULTIMATE</option>
                                  </select>
                               </div>
                               <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Yield Price (DT)</label>
                                 <Input type="number" value={tierForm.price || 0} onChange={e => setTierForm({ ...tierForm, price: Number(e.target.value) })} className="h-12 rounded-2xl bg-white font-black italic" />
                               </div>
                               <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Max Messages</label>
                                 <Input placeholder="Unlimited" type="number" value={tierForm.maxMessages || ''} onChange={e => setTierForm({ ...tierForm, maxMessages: e.target.value ? Number(e.target.value) : null })} className="h-12 rounded-2xl bg-white font-bold" />
                               </div>
                               <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Call Quota (Min)</label>
                                 <Input 
                                   placeholder={tierForm.tierType === 'ULTIMATE' ? 'Unlimited' : 'None'} 
                                   type="number" 
                                   disabled={tierForm.tierType === 'ULTIMATE'}
                                   value={tierForm.tierType === 'ULTIMATE' ? '' : (tierForm.maxCallDuration || '')} 
                                   onChange={e => setTierForm({ ...tierForm, maxCallDuration: e.target.value ? Number(e.target.value) : null })} 
                                   className="h-12 rounded-2xl bg-white font-bold disabled:bg-slate-50 disabled:text-slate-400" 
                                 />
                               </div>

                               {/* Sessions Config Section */}
                               <div className="col-span-2 space-y-4 pt-4 border-t border-slate-50">
                                 <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-900">Config: Reservation Pipeline</label>
                                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Define sequence of engagement sessions</p>
                                    </div>
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => setTierForm({ 
                                        ...tierForm, 
                                        sessionsConfig: [...(tierForm.sessionsConfig || []), { duration: 60, label: `Session ${(tierForm.sessionsConfig?.length || 0) + 1}` }] 
                                      })}
                                      className="text-blue-600 font-bold text-[10px] h-8 rounded-lg bg-blue-50 hover:bg-blue-100"
                                    >
                                      <Plus className="w-3 h-3 mr-1" /> Add Phase
                                    </Button>
                                 </div>

                                 <div className="space-y-3">
                                   {tierForm.sessionsConfig?.map((session, idx) => (
                                     <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                       <div className="flex-1 flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{idx + 1}</div>
                                          <Input 
                                              placeholder="Label (e.g. Kickoff)" 
                                              value={session.label} 
                                              onChange={e => {
                                                const newCfg = [...(tierForm.sessionsConfig || [])]
                                                newCfg[idx].label = e.target.value
                                                setTierForm({ ...tierForm, sessionsConfig: newCfg })
                                              }}
                                              className="h-10 rounded-xl bg-white/50 text-xs font-bold" 
                                          />
                                       </div>
                                       <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2">
                                          <Input 
                                            type="number" 
                                            value={session.duration} 
                                            onChange={e => {
                                              const newCfg = [...(tierForm.sessionsConfig || [])]
                                              newCfg[idx].duration = Number(e.target.value)
                                              setTierForm({ ...tierForm, sessionsConfig: newCfg })
                                            }}
                                            className="w-20 h-8 border-none bg-transparent text-xs font-black text-center" 
                                          />
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter pr-2">Min</span>
                                       </div>
                                       <Button 
                                         type="button"
                                         variant="ghost" 
                                         size="icon" 
                                         onClick={() => {
                                           const newCfg = (tierForm.sessionsConfig || []).filter((_, i) => i !== idx)
                                           setTierForm({ ...tierForm, sessionsConfig: newCfg })
                                          }}
                                         className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-xl flex-shrink-0"
                                       >
                                         <Trash2 className="w-4 h-4" />
                                       </Button>
                                     </div>
                                   ))}
                                 </div>
                                 
                                 {/* Validation Message */}
                                 {tierForm.sessionsConfig && tierForm.sessionsConfig.length > 0 && (
                                   <div className={cn(
                                     "p-3 rounded-xl border flex items-center gap-2",
                                     tierForm.tierType !== 'ULTIMATE' && tierForm.maxCallDuration && tierForm.sessionsConfig.reduce((acc, s) => acc + s.duration, 0) > tierForm.maxCallDuration
                                       ? "bg-red-50 border-red-100 text-red-600"
                                       : "bg-emerald-50 border-emerald-100 text-emerald-600"
                                   )}>
                                      <AlertCircle className="w-4 h-4" />
                                      <span className="text-[10px] font-bold uppercase tracking-tight">
                                        Pipeline Total: {tierForm.sessionsConfig.reduce((acc, s) => acc + s.duration, 0)} min 
                                        {tierForm.tierType === 'ULTIMATE' ? ' (Illimité autorisé)' : ` / ${tierForm.maxCallDuration || 0} min allocation`}
                                      </span>
                                   </div>
                                 )}
                               </div>

                               <div className="col-span-2 flex items-center gap-3 p-4 bg-white/50 rounded-2xl border border-slate-100/50">
                                  <input 
                                    type="checkbox" 
                                    id="canSelect"
                                    checked={tierForm.canSelectConsultant}
                                    onChange={e => setTierForm({ ...tierForm, canSelectConsultant: e.target.checked })}
                                    className="w-4 h-4 rounded-lg text-blue-600"
                                  />
                                  <label htmlFor="canSelect" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-pointer">Protocol: Allow expert selection</label>
                               </div>
                               <div className="col-span-2 space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Constraint Bio</label>
                                 <Textarea value={tierForm.description || ''} onChange={e => setTierForm({ ...tierForm, description: e.target.value })} className="rounded-2xl bg-white h-20" />
                               </div>
                             </div>
                             
                             <footer className="flex gap-3 pt-6 border-t border-slate-100">
                               <Button onClick={handleTierSubmit} className="rounded-xl bg-blue-600 text-white font-black italic h-12 flex-1 shadow-lg shadow-blue-100">Commit Tier</Button>
                               <Button variant="ghost" onClick={() => setEditTierId(null)} className="rounded-xl font-bold h-12">Abandon</Button>
                             </footer>
                           </Card>
                        )}

                        <Accordion type="single" collapsible className="space-y-3">
                          {tiers.map((tier) => (
                            <AccordionItem 
                              key={tier.id} 
                              value={tier.id}
                              className="border-none rounded-[28px] bg-slate-50/50 overflow-hidden group transition-all hover:bg-white hover:shadow-lg"
                            >
                              <div className="relative">
                                <AccordionTrigger className="px-6 py-5 hover:no-underline flex-1">
                                  <div className="flex items-center gap-4 text-left">
                                    <div className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                                      tier.tierType === 'PREMIUM' ? "bg-indigo-600 text-white" : "bg-white text-slate-900 border border-slate-100/50"
                                    )}>
                                      <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-900 uppercase tracking-tighter">{tier.tierType} Protocol</span>
                                        <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase">{tier.price} DT</Badge>
                                      </div>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                                        {tier.maxMessages ? `${tier.maxMessages} COMMS` : 'UNLIMITED COMMS'} • {tier.maxCallDuration ? `${tier.maxCallDuration} MIN SYNC` : 'NO LIVE SYNC'}
                                      </span>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                
                                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 rounded-lg bg-white/80 hover:bg-blue-600 hover:text-white" 
                                    onClick={(e) => { e.stopPropagation(); setEditTierId(tier.id); setTierForm(tier) }}
                                   >
                                      <Edit3 size={12} />
                                   </Button>
                                   <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 rounded-lg bg-white/80 hover:bg-red-500 hover:text-white" 
                                    onClick={(e) => { e.stopPropagation(); handleTierDelete(tier.id) }}
                                   >
                                      <Trash2 size={12} />
                                   </Button>
                                </div>
                              </div>
                              <AccordionContent className="px-6 pb-6 pt-2">
                                <div className="p-4 rounded-2xl bg-white border border-slate-100">
                                   <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                                     {tier.description || 'Standard operating procedure for this tier allocation.'}
                                   </p>
                                   <div className="mt-4 flex gap-4 border-t border-slate-50 pt-4">
                                      <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", tier.canSelectConsultant ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expert Freedom: {tier.canSelectConsultant ? 'Granted' : 'Locked'}</span>
                                      </div>
                                   </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                      
                      {tiers.length === 0 && !editTierId && (
                        <div className="p-12 rounded-[40px] bg-slate-50/50 border border-dashed border-slate-200 text-center">
                          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Pricing Pipeline Empty</p>
                          <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase">Initialize at least one engagement tier.</p>
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Save Floating Action Button */}
                  <div className="mt-16 flex items-center justify-between pt-8 border-t border-slate-50">
                    {selectedId && (
                      <Button 
                        variant="ghost" 
                        className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl font-bold text-xs uppercase tracking-widest px-6"
                        onClick={handleDelete}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Dismantle Service
                      </Button>
                    )}
                    <Button 
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="rounded-[28px] bg-blue-600 hover:bg-blue-700 text-white font-black italic text-lg px-12 h-16 shadow-2xl shadow-blue-100 transition-all hover:scale-105 active:scale-95 disabled:bg-slate-300"
                    >
                      {submitting ? 'Synthesizing...' : 'Commit Changes'} <Save className="w-5 h-5 ml-3" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </StandardPage>
  )
}
