'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Settings2, 
  ChevronRight, 
  Search, 
  Edit3, 
  Save,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  ChevronDown,
  X,
  Eye,
  Type,
  AlignLeft,
  Calendar,
  Rocket,
  Loader2
} from 'lucide-react'
import { StandardPage } from '@/components/admin/standard-page'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

type Blog = { 
  id: string; 
  title: string; 
  content: string; 
  excerpt?: string; 
  icon?: string; 
  image?: string; 
  published: boolean;
  createdAt: string;
}

export default function BlogsCMS() {
  const [blogs, setBlogs] = React.useState<Blog[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<Partial<Blog>>({ published: false })
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isEditing, setIsEditing] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)

  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [iconFile, setIconFile] = React.useState<File | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => { 
    loadBlogs() 
  }, [])

  React.useEffect(() => {
    if (selectedId) {
      const selected = blogs.find(b => b.id === selectedId)
      if (selected) {
        setForm(selected)
        setImageFile(null)
        setIconFile(null)
      }
    } else {
      setForm({ published: false })
      setImageFile(null)
      setIconFile(null)
    }
  }, [selectedId, blogs])

  const loadBlogs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/blogs')
      if (res.ok) {
        const data = await res.json()
        setBlogs(Array.isArray(data) ? data : [])
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
    setForm({ published: false })
    setImageFile(null)
    setIconFile(null)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('content', form.content)
      formData.append('published', form.published ? 'true' : 'false')
      if (form.excerpt) formData.append('excerpt', form.excerpt)
      if (selectedId) formData.append('id', selectedId)
      
      if (imageFile) formData.append('image', imageFile)
      if (iconFile) formData.append('icon', iconFile)

      const method = selectedId ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/blogs', {
        method,
        body: formData,
      })
      if (res.ok) {
        await loadBlogs()
        if (!selectedId) {
          const newBlog = await res.json()
          setSelectedId(newBlog.id)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) {
      setIsEditing(false)
      return
    }
    if (!confirm('Are you sure you want to delete this?')) return
    try {
      const res = await fetch(`/api/admin/blogs?id=${selectedId}`, { method: 'DELETE' })
      if (res.ok) {
        await loadBlogs()
        setSelectedId(null)
        setIsEditing(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <StandardPage
      title="Content Engine"
      description="Draft, edit, and publish engaging blog articles and company updates."
      breadcrumbs={[{ label: 'Content' }, { label: 'Blogs' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Feed Pane */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search drafts & articles..."
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
              Draft New Entry
            </button>

            {filteredBlogs.map((blog, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={blog.id}
              >
                <div 
                  onClick={() => handleSelect(blog.id)}
                  className={cn(
                    "relative overflow-hidden p-4 rounded-[28px] border cursor-pointer transition-all duration-300 group",
                    selectedId === blog.id 
                      ? "bg-white border-blue-600 shadow-xl shadow-blue-50 ring-4 ring-blue-600/5" 
                      : "bg-white/60 border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-lg"
                  )}
                >
                  <div className="flex gap-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                      {blog.image ? (
                        <img src={blog.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="font-bold text-slate-900 truncate leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </h4>
                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          "rounded-lg px-2 py-0 border-none text-[9px] font-black uppercase tracking-tight",
                          blog.published ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                        )}>
                          {blog.published ? 'Live' : 'Draft'}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Few mins ago'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all",
                    selectedId === blog.id ? "text-blue-600 translate-x-1" : "text-slate-200 group-hover:text-slate-400"
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
                  <Rocket className="w-10 h-10 text-blue-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Editor Ready</h3>
                <p className="text-sm text-slate-500 max-w-xs font-medium mb-8">
                  Create beautiful, high-impact articles to build authority and reach more clients.
                </p>
                <Button 
                  onClick={handleCreateNew}
                  className="rounded-2xl bg-slate-900 hover:bg-black text-white px-8 h-12 font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-1"
                >
                  Create New Article <ArrowRight className="w-4 h-4 ml-2" />
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
                        checked={form.published} 
                        onCheckedChange={(v) => setForm({ ...form, published: v })} 
                       />
                       <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                         {form.published ? 'Published' : 'Draft Mode'}
                       </span>
                    </div>
                    <div className="h-4 w-px bg-slate-100" />
                    <button 
                      onClick={() => setShowPreview(!showPreview)}
                      className={cn(
                        "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors",
                        showPreview ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <Eye className="w-4 h-4" />
                      {showPreview ? 'Hide Preview' : 'Live Preview'}
                    </button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl hover:bg-slate-100"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Editor Canvas */}
                  <Card className={cn(
                    "rounded-[40px] border-none bg-white/80 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.04)] p-8 md:p-12 relative overflow-hidden transition-all duration-500",
                    showPreview ? "lg:opacity-50" : "opacity-100"
                  )}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
                    
                    <div className="relative space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                          <Type className="w-3 h-3" /> Article Headline
                        </label>
                        <Input 
                          value={form.title || ''} 
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="What's the big story?" 
                          className="h-16 text-2xl font-black border-none bg-transparent shadow-none px-0 focus-visible:ring-0 placeholder:text-slate-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                            <ImageIcon className="w-3 h-3" /> Hero Image
                          </label>
                          <div className="group relative h-48 rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer overflow-hidden">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]) }} 
                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            />
                            {imageFile ? (
                              <img src={URL.createObjectURL(imageFile)} className="h-full w-full object-cover" alt="Hero" />
                            ) : form.image ? (
                              <img src={form.image} className="h-full w-full object-cover" alt="Hero" />
                            ) : (
                              <>
                                <Plus className="w-10 h-10 text-slate-200 group-hover:text-blue-400 transition-colors" />
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Select Brilliance</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Icon
                          </label>
                          <div className="group relative h-48 rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer overflow-hidden">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => { if (e.target.files?.[0]) setIconFile(e.target.files[0]) }} 
                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            />
                            {iconFile ? (
                              <img src={URL.createObjectURL(iconFile)} className="h-24 w-24 object-contain" alt="Icon" />
                            ) : form.icon ? (
                              <img src={form.icon} className="h-24 w-24 object-contain" alt="Icon" />
                            ) : (
                              <>
                                <Plus className="w-10 h-10 text-slate-200 group-hover:text-blue-400 transition-colors" />
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Upload Icon</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                          <AlignLeft className="w-3 h-3" /> Short Excerpt
                        </label>
                        <Textarea 
                          value={form.excerpt || ''} 
                          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                          placeholder="A quick summary..." 
                          className="min-h-[80px] border border-slate-100 rounded-2xl bg-white shadow-sm px-4 py-3 text-sm font-medium resize-none placeholder:text-slate-300 focus-visible:ring-blue-600/20"
                        />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-50">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                          <AlignLeft className="w-3 h-3" /> Narrative Body
                        </label>
                        
                        {/* Simulation of a Rich Text toolbar */}
                        <div className="flex items-center gap-1 p-1 bg-slate-50/80 rounded-xl w-fit">
                           <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-xs font-black">B</div>
                           <div className="w-8 h-8 rounded-lg hover:bg-white transition-all flex items-center justify-center text-xs font-serif italic text-slate-400">I</div>
                           <div className="w-8 h-8 rounded-lg hover:bg-white transition-all flex items-center justify-center text-xs underline text-slate-400">U</div>
                           <div className="w-px h-4 bg-slate-200 mx-1" />
                           <div className="px-2 h-8 rounded-lg hover:bg-white transition-all flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider">H1</div>
                           <div className="px-2 h-8 rounded-lg hover:bg-white transition-all flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider">H2</div>
                        </div>

                        <Textarea 
                          value={form.content || ''} 
                          onChange={(e) => setForm({ ...form, content: e.target.value })}
                          placeholder="Begin your narrative here..." 
                          className="min-h-[400px] border-none bg-transparent shadow-none px-0 focus-visible:ring-0 text-base font-medium leading-relaxed resize-none placeholder:text-slate-200"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Right-side Preview Modal Simulation if showPreview is true */}
                  <AnimatePresence>
                    {showPreview && (
                      <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed top-24 right-10 bottom-10 w-[450px] bg-white rounded-[40px] shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col"
                      >
                         <div className="h-14 border-b border-slate-50 flex items-center justify-between px-6 bg-slate-50/30">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Website Real-time Preview</span>
                            <button onClick={() => setShowPreview(false)}><X className="w-4 h-4 text-slate-300" /></button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="h-48 rounded-3xl bg-slate-50 overflow-hidden relative">
                               {imageFile ? (
                                  <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" alt="" />
                               ) : form.image && (
                                  <img src={form.image} className="w-full h-full object-cover" alt="" />
                               )}
                               
                               <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden p-2">
                                  {iconFile ? (
                                     <img src={URL.createObjectURL(iconFile)} className="w-full h-full object-contain" alt="" />
                                  ) : form.icon && (
                                     <img src={form.icon} className="w-full h-full object-contain" alt="" />
                                  )}
                               </div>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 leading-tight">{form.title || 'Draft Title'}</h1>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-blue-600" />
                               <div className="text-[10px] font-bold uppercase tracking-wider">
                                  <p className="text-slate-900">DSL Editor</p>
                                  <p className="text-slate-400">Published Today</p>
                               </div>
                            </div>
                            <div className="space-y-4">
                               <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                 {form.content || 'Start typing in the editor to see your content come to life here...'}
                               </p>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Save Floating Action Button */}
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      onClick={handleDelete}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-bold text-sm px-6"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Discard Narrative
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving || !form.title || !form.content}
                      className="rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-black italic text-lg px-10 h-16 shadow-2xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      Publish to Live <Rocket className="w-5 h-5 ml-3" />
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
