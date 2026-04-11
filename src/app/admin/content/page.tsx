'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Monitor, 
  Smartphone, 
  Layout, 
  Image as ImageIcon, 
  Settings2, 
  Save, 
  Upload, 
  CloudUpload,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MousePointer2,
  AppWindow,
  Navigation,
  Columns
} from 'lucide-react'
import { StandardPage } from '@/components/admin/standard-page'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type Section = 'hero' | 'navbar' | 'footer'

export default function SiteVisualEditor() {
  const [activeTab, setActiveTab] = React.useState<Section>('hero')
  const [content, setContent] = React.useState<any>({})
  const [logoUrl, setLogoUrl] = React.useState('/logo.jpeg')
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    loadContent()
  }, [activeTab])

  const loadContent = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/content/${activeTab}`)
      if (res.ok) {
        const data = await res.json()
        setContent(data.value || {})
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    await fetch(`/api/content/${activeTab}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: content })
    })
    setIsLoading(false)
  }

  return (
    <StandardPage
      title="Site Visual Builder"
      description="Customize your brand identity and website components in real-time."
      breadcrumbs={[{ label: 'Content' }, { label: 'Site Editor' }]}
    >
      <Tabs defaultValue="hero" className="space-y-10" onValueChange={(v) => setActiveTab(v as Section)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <TabsList className="bg-white/50 backdrop-blur-md border border-slate-100 p-1.5 rounded-[24px] shadow-sm">
            <TabsTrigger value="hero" className="gap-2 px-6 rounded-[18px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <AppWindow className="w-4 h-4" /> Hero Section
            </TabsTrigger>
            <TabsTrigger value="navbar" className="gap-2 px-6 rounded-[18px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Navigation className="w-4 h-4" /> Navigation
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2 px-6 rounded-[18px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Columns className="w-4 h-4" /> Global Footer
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-3">
             <Button variant="ghost" className="rounded-2xl font-bold text-xs gap-2">
               <ExternalLink className="w-4 h-4" /> Preview Live Site
             </Button>
             <Button 
               onClick={handleSave}
               disabled={isLoading}
               className="rounded-2xl bg-slate-900 hover:bg-black text-white px-8 h-12 font-black italic text-base shadow-xl shadow-slate-200"
             >
               {isLoading ? 'Saving...' : 'Deploy Changes'} <Save className="w-4 h-4 ml-2" />
             </Button>
          </div>
        </div>

        <TabsContent value="hero" className="mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Control Panel */}
            <div className="lg:col-span-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 rounded-[40px] border-none bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-8">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                         <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Dynamic Imagery</h3>
                   </div>
                   
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hero Background Slideshow</label>
                      <div className="group relative h-48 rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer overflow-hidden">
                        <CloudUpload className="w-12 h-12 text-slate-300 mb-3 group-hover:text-blue-600 transition-colors" />
                        <span className="text-xs font-bold text-slate-500">Drag & Drop new visual assets</span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                   </div>
                </Card>

                <Card className="p-8 rounded-[40px] border-none bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                         <Layout className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Text Content</h3>
                   </div>
                   
                   <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Main Headline</label>
                        <Input 
                          value={content.title || ''} 
                          onChange={(e) => setContent({ ...content, title: e.target.value })}
                          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:ring-4 focus:ring-blue-600/5 font-black uppercase italic tracking-tight"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Supporting Description</label>
                        <Textarea 
                          value={content.subtitle || ''} 
                          onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                          className="h-24 rounded-2xl border-slate-100 bg-white/50 focus:ring-4 focus:ring-blue-600/5 font-medium leading-relaxed"
                        />
                      </div>
                   </div>
                </Card>

                {/* Second Row: Actions */}
                <Card className="p-8 rounded-[40px] border-none bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-6 md:col-span-2">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                         <MousePointer2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Interaction & CTA</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Button Text</label>
                        <Input 
                          value={content.ctaText || ''} 
                          onChange={(e) => setContent({ ...content, ctaText: e.target.value })}
                          className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm font-bold"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Destination URL</label>
                        <Input 
                          value={content.ctaLink || ''} 
                          onChange={(e) => setContent({ ...content, ctaLink: e.target.value })}
                          className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm font-bold"
                        />
                     </div>
                   </div>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Similar redesign for Navbar and Footer contents */}
        <TabsContent value="navbar" className="mt-0 outline-none">
           <Card className="p-10 rounded-[40px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
             <div className="max-w-4xl space-y-10">
                <div className="flex items-end justify-between">
                   <div>
                      <h3 className="text-2xl font-black text-slate-900">Brand Elements</h3>
                      <p className="text-sm font-medium text-slate-400 mt-1">Manage global navigation logo and identity.</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                         <img src={logoUrl} className="w-full h-full object-contain p-2" alt="Current Logo" />
                      </div>
                      <Button variant="outline" className="rounded-xl font-bold text-xs h-11 px-6 border-slate-200">Replace Logo</Button>
                   </div>
                </div>

                <div className="space-y-6">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Menu Navigation Flow</label>
                   <div className="space-y-3">
                      {(content.links || []).map((link: any, i: number) => (
                        <div key={i} className="flex gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                           <div className="flex-1 space-y-4 md:flex md:space-y-0 md:gap-4">
                              <Input 
                                placeholder="Menu Label" 
                                value={link.label} 
                                className="h-11 rounded-xl border-white bg-white/80 shadow-none focus:ring-4 focus:ring-blue-600/5 font-bold" 
                              />
                              <Input 
                                placeholder="Link Link (/...)" 
                                value={link.href} 
                                className="h-11 rounded-xl border-white bg-white/80 shadow-none focus:ring-4 focus:ring-blue-600/5 font-bold" 
                              />
                           </div>
                           <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="w-5 h-5" />
                           </Button>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full h-16 rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 font-bold gap-2 hover:bg-blue-50/30 hover:text-blue-600 hover:border-blue-200 transition-all">
                         <Plus className="w-5 h-5" /> Add Navigation Node
                      </Button>
                   </div>
                </div>
             </div>
           </Card>
        </TabsContent>
      </Tabs>
      
      {/* Live Preview System (Visual Overlay Example) */}
      <div className="mt-20 pt-10 border-t border-slate-100">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8">
            Global Design <ChevronRight className="w-3" /> System Preview
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-[32px] bg-white shadow-sm border border-slate-50 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Monitor className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 leading-tight">Desktop Optix</h4>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Optimal View</p>
               </div>
            </div>
            <div className="p-6 rounded-[32px] bg-white shadow-sm border border-slate-50 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                  <Smartphone className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="font-bold text-slate-400 leading-tight">Mobile Responsive</h4>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Sync Pending</p>
               </div>
            </div>
         </div>
      </div>
    </StandardPage>
  )
}
