'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Search, 
  X,
  Type,
  AlignLeft,
  Rocket,
  ArrowRight,
  HelpCircle,
  GripVertical
} from 'lucide-react'
import { StandardPage } from '@/components/admin/standard-page'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

type Faq = { 
  id: string; 
  question: string; 
  answer: string; 
  order: number;
  isActive: boolean;
}

export default function FaqsAdmin() {
  const { locale } = useParams() as { locale: string }
  const t = useTranslations('adminPage.faqs')
  const commonT = useTranslations('common')
  const [faqs, setFaqs] = React.useState<Faq[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<Partial<Faq>>({ isActive: true, order: 0 })
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isEditing, setIsEditing] = React.useState(false)

  React.useEffect(() => { 
    loadFaqs() 
  }, [])

  React.useEffect(() => {
    if (selectedId) {
      const selected = faqs.find(f => f.id === selectedId)
      if (selected) {
        setForm(selected)
      }
    } else {
      setForm({ isActive: true, order: faqs.length })
    }
  }, [selectedId, faqs])

  const loadFaqs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/faqs')
      if (res.ok) {
        const result = await res.json()
        const data = result.data || result
        setFaqs(Array.isArray(data) ? data : [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setIsEditing(true)
  }

  const handleCreateNew = () => {
    setSelectedId(null)
    setForm({ isActive: true, order: faqs.length })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!form.question || !form.answer) {
      toast.error(t("validation.required"))
      return;
    }

    try {
      const method = selectedId ? 'PUT' : 'POST'
      const url = selectedId ? `/api/faqs/${selectedId}` : '/api/faqs'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        toast.success(selectedId ? t("messages.updated") : t("messages.created"))
        await loadFaqs()
        setIsEditing(false)
        setSelectedId(null)
      } else {
        toast.error(t("messages.saveFailed"))
      }
    } catch (error) {
      toast.error(commonT("error"))
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return
    
    if (confirm(t("confirmDelete"))) {
      try {
        const res = await fetch(`/api/faqs/${selectedId}`, {
          method: 'DELETE'
        })
        
        if (res.ok) {
          toast.success(t("messages.deleted"))
          await loadFaqs()
          setIsEditing(false)
          setSelectedId(null)
        } else {
          toast.error(t("messages.deleteFailed"))
        }
      } catch (error) {
        toast.error(commonT("error"))
      }
    }
  }

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.order - b.order)

  return (
    <StandardPage
      locale={locale as string}
      title={t("title")}
      description={t("description")}
      breadcrumbs={[{ label: t("breadcrumbs.content") }, { label: t("breadcrumbs.faqs") }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Feed Pane */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t("search")}
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
              {t("addNew")}
            </button>

            {filteredFaqs.map((faq, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={faq.id}
              >
                <div 
                  onClick={() => handleSelect(faq.id)}
                  className={cn(
                    "relative overflow-hidden p-4 rounded-[28px] border cursor-pointer transition-all duration-300 group flex gap-3 items-center",
                    selectedId === faq.id 
                      ? "bg-white border-blue-600 shadow-xl shadow-blue-50 ring-4 ring-blue-600/5" 
                      : "bg-white/60 border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-lg",
                    !faq.isActive && "opacity-60"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate leading-tight">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-1">{faq.answer}</p>
                  </div>
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
                  <HelpCircle className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t("emptyState.title")}</h3>
                <p className="text-sm text-slate-500 max-w-xs font-medium mb-8">
                  {t("emptyState.description")}
                </p>
                <Button 
                  onClick={handleCreateNew}
                  className="rounded-2xl bg-slate-900 hover:bg-black text-white px-8 h-12 font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-1"
                >
                  {t("createNew")} <ArrowRight className="w-4 h-4 ml-2" />
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
                {/* Editor Settings Bar */}
                <div className="flex items-center justify-between px-6 py-4 rounded-[32px] bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
<Switch 
                         checked={form.isActive} 
                         onCheckedChange={(v) => setForm({ ...form, isActive: v })} 
                        />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                          {form.isActive ? t("status.active") : t("status.hidden")}
                        </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                        setIsEditing(false);
                        setSelectedId(null);
                    }}
                    className="rounded-xl hover:bg-slate-100"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Editor Canvas */}
                  <Card className="rounded-[40px] border-none bg-white/80 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.04)] p-8 md:p-12 relative overflow-hidden transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
                    
                    <div className="relative space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                          <Type className="w-3 h-3" /> {t("form.question")}
                        </label>
                        <Input 
                          value={form.question || ''} 
                          onChange={(e) => setForm({ ...form, question: e.target.value })}
                          placeholder={t("form.questionPlaceholder")} 
                          className="h-16 text-2xl font-black border-none bg-transparent shadow-none px-0 focus-visible:ring-0 placeholder:text-slate-200"
                        />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-50">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                          <AlignLeft className="w-3 h-3" /> {t("form.answer")}
                        </label>

                        <Textarea 
                          value={form.answer || ''} 
                          onChange={(e) => setForm({ ...form, answer: e.target.value })}
                          placeholder={t("form.answerPlaceholder")} 
                          className="min-h-[200px] border-none bg-transparent shadow-none px-0 focus-visible:ring-0 text-base font-medium leading-relaxed resize-none placeholder:text-slate-200"
                        />
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-50">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                          <GripVertical className="w-3 h-3" /> {t("form.order")}
                        </label>
                        <Input 
                          type="number"
                          value={form.order || 0} 
                          onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                          placeholder="0" 
                          className="h-12 w-24 text-lg font-bold border-none bg-slate-50 rounded-xl px-4 focus-visible:ring-2"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Save Floating Action Button */}
                  <div className="flex items-center justify-between">
                    {selectedId ? (
                        <Button 
                        variant="ghost" 
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-bold text-sm px-6"
                        >
                        <Trash2 className="w-4 h-4 mr-2" /> {commonT("delete")}
                        </Button>
                    ) : <div/>}
                    <Button 
                      onClick={handleSave}
                      className="rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-black italic text-lg px-10 h-16 shadow-2xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                    >
                      {t("save")} <Rocket className="w-5 h-5 ml-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </StandardPage>
  )
}
