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
  X
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
  tierType: 'BASIC' | 'STANDARD' | 'PREMIUM'; 
  price: number; 
  maxMessages: number | null; 
  maxCallDuration: number | null; 
  canSelectConsultant: boolean; 
  description: string | null;
}

export default function ServicesCMS() {
  const [services, setServices] = React.useState<Service[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<Partial<Service>>({})
  const [tiers, setTiers] = React.useState<Tier[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isEditing, setIsEditing] = React.useState(false)

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
    } else {
      setForm({})
      setTiers([])
    }
  }, [selectedId, services])

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/services')
      if (res.ok) {
        const data = await res.json()
        setServices(Array.isArray(data) ? data : [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadTiers = async (serviceId: string) => {
    const res = await fetch(`/api/admin/services/tiers?serviceId=${serviceId}`)
    if (res.ok) setTiers(await res.json())
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
                !selectedId && isEditing ? "border-blue-600 bg-blue-50/50 text-blue-600" : ""
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
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                      {service.icon || service.image ? (
                        <img src={service.icon || service.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-slate-200" />
                        </div>
                      )}
                      {selectedId === service.id && (
                        <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                          <Edit3 className="w-4 h-4 text-blue-600" />
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
                        "rounded-lg px-2 py-0 border-none text-[9px] font-black uppercase tracking-tight",
                        service.isActive !== false ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {service.isActive !== false ? 'Active' : 'Draft'}
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
                  Pick an existing service from the library or create a brand new offering for your clients.
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedId ? 'Update Parameters' : 'Initial Setup'}</p>
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
                            placeholder="e.g. Strategic Coaching" 
                            className="h-14 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-4 focus:ring-blue-600/5 text-base font-bold placeholder:font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Classification</label>
                          <Input 
                            value={form.category || ''} 
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            placeholder="e.g. Business Strategy" 
                            className="h-14 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-4 focus:ring-blue-600/5 text-base font-bold placeholder:font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2 h-full flex flex-col">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Core Description</label>
                          <Textarea 
                            value={form.description || ''} 
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Explain the value proposition..." 
                            className="flex-1 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-4 focus:ring-blue-600/5 text-sm font-medium resize-none"
                          />
                        </div>
                      </div>

                      {/* Image Dropzone style */}
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Visual Assets</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group relative h-32 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                            {form.icon ? (
                              <img src={form.icon} className="h-16 object-contain" alt="Icon" />
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Primary Icon</span>
                              </>
                            )}
                          </div>
                          <div className="group relative h-32 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                            {form.image ? (
                              <img src={form.image} className="h-full w-full object-cover rounded-3xl" alt="Cover" />
                            ) : (
                              <>
                                <Layout className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Hero Image</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tier Builder */}
                    <section className="pt-10 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Pricing Architecture</h3>
                          <p className="text-xs text-slate-400 font-medium">Define value tiers and engagement constraints.</p>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-wider px-4">
                          <FolderPlus className="w-3.5 h-3.5 mr-2" /> Add Tier
                        </Button>
                      </div>

                      <Accordion type="single" collapsible className="space-y-4">
                        {tiers.map((tier) => (
                          <AccordionItem 
                            key={tier.id} 
                            value={tier.id}
                            className="border-none rounded-[32px] bg-slate-50/50 overflow-hidden"
                          >
                            <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                              <div className="flex items-center gap-4 text-left">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                  tier.tierType === 'PREMIUM' ? "bg-indigo-600 text-white" : "bg-white text-slate-900"
                                )}>
                                  <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{tier.tierType} PACK</span>
                                    <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase">{tier.price} DT</Badge>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    {tier.maxMessages ? `${tier.maxMessages} Messages` : 'Unlimited'} • {tier.maxCallDuration ? `${tier.maxCallDuration} Min Call` : 'No Call'}
                                  </span>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 space-y-6">
                              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tier Price (DT)</label>
                                   <Input defaultValue={tier.price} className="h-10 rounded-xl border-white bg-white/50" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Constraints</label>
                                   <div className="flex items-center gap-3 h-10 px-3 bg-white/50 rounded-xl border border-white">
                                      <input type="checkbox" defaultChecked={tier.canSelectConsultant} className="rounded" />
                                      <span className="text-xs font-bold text-slate-600">Freedom to pick expert</span>
                                   </div>
                                </div>
                                <div className="col-span-2 space-y-2">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Inclusions/Description</label>
                                   <Textarea defaultValue={tier.description || ''} className="rounded-xl border-white bg-white/50 h-20" />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      {tiers.length === 0 && (
                        <div className="p-10 rounded-[32px] bg-slate-50/50 border border-dashed border-slate-200 text-center">
                          <p className="text-sm font-bold text-slate-400">No tiers configured. Start by adding a basic plan.</p>
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Save Floating Action Button */}
                  <div className="mt-12 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-bold text-sm px-6"
                      onClick={() => console.log('Delete service')}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Finalize Destruction
                    </Button>
                    <Button 
                      className="rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-black italic text-lg px-10 h-16 shadow-2xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                    >
                      Commit Changes <Save className="w-5 h-5 ml-3" />
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
