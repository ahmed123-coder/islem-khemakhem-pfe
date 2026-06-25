'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
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

type Section = 'hero' | 'logo' | 'footer' | 'hero-solutions' | 'hero-approches' | 'hero-contact'

export default function SiteVisualEditor() {
  const { locale } = useParams() as { locale: string }
  const t = useTranslations("adminPage.content")
  const [activeTab, setActiveTab] = React.useState<Section>('hero')
  const [content, setContent] = React.useState<any>({})
  const [logoUrl, setLogoUrl] = React.useState('/logo.jpeg')
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadContent()
    setSelectedFile(null)
    setPreviewUrl(null)
  }, [activeTab])

  const loadContent = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/content/${activeTab}`)
      if (res.ok) {
        const result = await res.json()
        const data = result.data || result
        setContent(data.value || {})
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let finalContent = { ...content }

      if (selectedFile) {
        const formData = new FormData()
        const isLogo = activeTab === 'logo'
        formData.append(isLogo ? 'logo' : 'image', selectedFile)
        
        const uploadRes = await fetch(isLogo ? '/api/upload/logo' : '/api/upload/image', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        
        if (uploadRes.ok) {
          const resData = uploadData.data || uploadData;
          if (isLogo) {
            finalContent.url = resData.logoUrl
            setLogoUrl(resData.logoUrl)
          } else {
            finalContent.image = resData.imageUrl
          }
        }
      }

      await fetch(`/api/content/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: finalContent })
      })

      setContent(finalContent)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <StandardPage
      locale={locale as string}
      title={t("title")}
      description={t("description")}
      breadcrumbs={[{ label: t("breadcrumbs.content") }, { label: t("breadcrumbs.siteEditor") }]}
    >
      <Tabs defaultValue="hero" className="space-y-10" onValueChange={(v) => setActiveTab(v as Section)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <TabsList className="bg-white/50 backdrop-blur-md border border-slate-100 p-1.5 rounded-[24px] shadow-sm">
            <TabsTrigger value="hero" className="gap-2 px-6 rounded-[18px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <AppWindow className="w-4 h-4" /> {t("tabs.homeHero")}
            </TabsTrigger>
            <TabsTrigger value="hero-solutions" className="gap-2 px-6 rounded-[18px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <AppWindow className="w-4 h-4" /> {t("tabs.solutionsHero")}
            </TabsTrigger>
            <TabsTrigger value="hero-approches" className="gap-2 px-6 rounded-[18px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <AppWindow className="w-4 h-4" /> {t("tabs.approchesHero")}
            </TabsTrigger>
            <TabsTrigger value="hero-contact" className="gap-2 px-6 rounded-[18px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <AppWindow className="w-4 h-4" /> {t("tabs.contactHero")}
            </TabsTrigger>
            <TabsTrigger value="logo" className="gap-2 px-6 rounded-[18px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <ImageIcon className="w-4 h-4" /> {t("tabs.globalLogo")}
            </TabsTrigger>
            
          </TabsList>
          <div className="flex items-center gap-3">
             

              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className="rounded-2xl bg-slate-900 hover:bg-black text-white px-8 h-12 font-black italic text-base shadow-xl shadow-slate-200"
              >
                {isLoading ? t("saving") : t("deploy")} <Save className="w-4 h-4 ml-2" />
              </Button>
           </div>
        </div>

        <TabsContent value={activeTab} className="mt-0 outline-none">
          {['hero', 'hero-solutions', 'hero-approches', 'hero-contact'].includes(activeTab) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Control Panel */}
            <div className="lg:col-span-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 rounded-[40px] border-none bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-8">
<div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                          <Sparkles className="w-5 h-5" />
                       </div>
                       <h3 className="text-xl font-bold text-slate-900">{t("dynamicImagery")}</h3>
                    </div>
                    
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("heroBgSlideshow")}</label>
                       <div className="group relative h-48 rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer overflow-hidden">
                         {(previewUrl || content.image) ? (
                           <img src={previewUrl || content.image} className="w-full h-full object-cover" alt="Hero Background Preview" />
                         ) : (
                           <>
                             <CloudUpload className="w-12 h-12 text-slate-300 mb-3 group-hover:text-blue-600 transition-colors" />
                             <span className="text-xs font-bold text-slate-500">{t("dragDrop")}</span>
                           </>
                         )}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0]
                              setSelectedFile(file)
                              setPreviewUrl(URL.createObjectURL(file))
                            }
                          }}
                        />
                      </div>
                   </div>
                </Card>

                <Card className="p-8 rounded-[40px] border-none bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-6">
<div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                          <Layout className="w-5 h-5" />
                       </div>
                       <h3 className="text-xl font-bold text-slate-900">{t("textContent")}</h3>
                    </div>
                    
                    <div className="space-y-5">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("mainHeadline")}</label>
                         <Input 
                           value={content.title || ''} 
                           onChange={(e) => setContent({ ...content, title: e.target.value })}
                           className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:ring-4 focus:ring-blue-600/5 font-black uppercase italic tracking-tight"
                         />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("supportingDesc")}</label>
                        <Textarea 
                          value={content.subtitle || ''} 
                          onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                          className="h-24 rounded-2xl border-slate-100 bg-white/50 focus:ring-4 focus:ring-blue-600/5 font-medium leading-relaxed"
                        />
                      </div>
                   </div>
                </Card>
                
              </div>
            </div>
          </div>
          )}
        </TabsContent>

        {/* Logo settings */}
        <TabsContent value="logo" className="mt-0 outline-none">
           <Card className="p-10 rounded-[40px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
             <div className="max-w-4xl space-y-10">
                <div className="flex items-end justify-between">
<div>
                       <h3 className="text-2xl font-black text-slate-900">{t("brandLogo")}</h3>
                       <p className="text-sm font-medium text-slate-400 mt-1">{t("brandLogoDesc")}</p>
                    </div>
                   <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                         <img src={previewUrl || content.url || logoUrl} className="w-full h-full object-contain p-2" alt="Current Logo" />
                      </div>
                      <div className="relative">
                        <Button variant="outline" className="rounded-xl font-bold text-xs h-11 px-6 border-slate-200">{t("replaceLogo")}</Button>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0]
                              setSelectedFile(file)
                              setPreviewUrl(URL.createObjectURL(file))
                            }
                          }}
                        />
                      </div>
                   </div>
                </div>
             </div>
           </Card>
        </TabsContent>
      </Tabs>
      
      
    </StandardPage>
  )
}
