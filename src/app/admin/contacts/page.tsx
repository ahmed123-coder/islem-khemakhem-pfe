'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Reply, 
  MoreVertical, 
  User,
  Inbox,
  Filter,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  AtSign,
  Loader2
} from 'lucide-react'
import { StandardPage } from '@/components/admin/standard-page'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Contact {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
}

export default function ContactsCRM() {
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isProcessing, setIsProcessing] = React.useState(false)

  React.useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/contacts')
      const result = await res.json()
      const data = result.data || result || []
      setContacts(data)
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Dismantle this communication record permanently?')) return
    const res = await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setContacts(contacts.filter(c => c.id !== id))
      if (selectedId === id) setSelectedId(contacts.find(c => c.id !== id)?.id || null)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setContacts(contacts.map(c => c.id === id ? { ...c, status: newStatus } : c))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedContact = contacts.find(c => c.id === selectedId)

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'new': return "bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-50"
      case 'read': return "bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-50"
      case 'replied': return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50"
      case 'processed': return "bg-slate-50 text-slate-500 border-slate-100 shadow-sm shadow-slate-50"
      default: return "bg-slate-50 text-slate-500 border-slate-100"
    }
  }

  return (
    <StandardPage
      title="Communication Hub"
      description="Manage inquiries, support requests, and professional outreach."
      breadcrumbs={[{ label: 'System' }, { label: 'Contacts' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* Left Sidebar: Inbox List */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {isLoading ? (
               <div className="p-8 text-center space-y-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Inbox...</p>
               </div>
            ) : filteredContacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => setSelectedId(contact.id)}
                className={cn(
                  "p-4 rounded-[32px] border cursor-pointer transition-all duration-300 group relative",
                  selectedId === contact.id 
                    ? "bg-white border-blue-600 shadow-xl shadow-blue-50 ring-4 ring-blue-600/5" 
                    : "bg-white/60 border-transparent hover:bg-white hover:border-slate-100"
                )}
              >
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-sm flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-600 font-bold text-xs uppercase italic">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-slate-900 truncate text-sm tracking-tight">{contact.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">
                      {contact.message}
                    </p>
                    <Badge className={cn("rounded-lg px-2 py-0 border-none text-[9px] font-black uppercase tracking-tight", getStatusStyle(contact.status))}>
                      {contact.status}
                    </Badge>
                  </div>
                </div>
                {selectedId === contact.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Detail View */}
        <div className="lg:col-span-8 h-full min-h-0">
          <AnimatePresence mode="wait">
            {selectedContact ? (
              <motion.div 
                key={selectedContact.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col"
              >
                <Card className="flex-1 flex flex-col rounded-[40px] border-none bg-white/80 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.04)] overflow-hidden">
                  {/* Detail Header */}
                  <header className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[120px] -mr-32 -mt-32 opacity-30" />
                    <div className="flex items-center gap-5 relative z-10">
                      <Avatar className="w-16 h-16 border-4 border-white shadow-xl">
                        <AvatarFallback className="bg-blue-600 text-white font-black text-xl italic uppercase">
                          {selectedContact.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                          {selectedContact.name}
                        </h2>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100/50">
                            <AtSign className="w-3.5 h-3.5" /> {selectedContact.email}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100/50">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(selectedContact.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 relative z-10">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(`mailto:${selectedContact.email}`)}
                        className="rounded-[18px] border-slate-100 bg-white h-11 px-6 font-bold text-xs transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
                      >
                        <Reply className="w-4 h-4 mr-2 text-blue-600" /> Dispatch Reply
                      </Button>
                      <Button 
                        disabled={isProcessing}
                        onClick={() => updateStatus(selectedContact.id, 'replied')}
                        className="rounded-[18px] bg-slate-900 hover:bg-black text-white h-11 px-6 font-bold text-xs shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 disabled:bg-slate-300"
                      >
                         {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />}
                         Mark Processed
                      </Button>
                    </div>
                  </header>

                  {/* Detail Body */}
                  <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    <section>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60 mb-6 block">Inquiry Metadata</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-5 rounded-[28px] bg-slate-50/50 border border-slate-100 flex flex-col justify-between h-24 group hover:bg-white hover:shadow-lg transition-all">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status</p>
                           <Badge className={cn("rounded-lg border-none font-black text-[9px] uppercase w-fit", getStatusStyle(selectedContact.status))}>
                             {selectedContact.status}
                           </Badge>
                        </div>
                        <div className="p-5 rounded-[28px] bg-slate-50/50 border border-slate-100 flex flex-col justify-between h-24 group hover:bg-white hover:shadow-lg transition-all">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Origin</p>
                           <p className="text-xs font-black text-slate-900 uppercase">External Form</p>
                        </div>
                        <div className="p-5 rounded-[28px] bg-slate-50/50 border border-slate-100 flex flex-col justify-between h-24 group hover:bg-white hover:shadow-lg transition-all">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Node</p>
                           <p className="text-xs font-black text-slate-900 uppercase italic">CMS Hub</p>
                        </div>
                        <div className="p-5 rounded-[28px] bg-slate-50/50 border border-slate-100 flex flex-col justify-between h-24 group hover:bg-white hover:shadow-lg transition-all">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID</p>
                           <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">#{selectedContact.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </section>

                    <section className="relative">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60 mb-6 block">Communication Corpus</label>
                       <div className="relative p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm overflow-hidden min-h-[200px] flex items-center group transition-shadow hover:shadow-xl">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50" />
                         <blockquote className="text-lg font-medium text-slate-700 leading-relaxed italic pr-12 relative z-10 flex gap-4">
                           <span className="text-4xl text-blue-100 font-serif leading-none h-fit select-none">“</span>
                           {selectedContact.message}
                           <span className="text-4xl text-blue-100 font-serif leading-none h-fit self-end select-none">”</span>
                         </blockquote>
                         <div className="absolute top-8 right-8">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-white shadow-sm transition-transform group-hover:scale-110">
                               <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                         </div>
                       </div>
                    </section>
                  </div>

                  {/* Detail Footer */}
                  <footer className="p-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="flex -space-x-3">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 text-[10px] font-black flex items-center justify-center text-slate-400">?</div>
                          ))}
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Version: 1.0.4-LTS</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDelete(selectedContact.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-[18px] font-black text-[10px] uppercase tracking-widest h-11 px-8 transition-colors active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Dismantle Inquiry
                    </Button>
                  </footer>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-[40px] border border-dashed border-slate-200 bg-slate-50/30 backdrop-blur-sm">
                <div className="w-24 h-24 rounded-[32px] bg-white flex items-center justify-center shadow-sm mb-6 relative group">
                   <div className="absolute -inset-4 bg-white/50 rounded-full blur-2xl animate-pulse" />
                   <Inbox className="w-12 h-12 text-slate-200 group-hover:text-blue-200 transition-colors relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Stream Standby</h3>
                <p className="text-sm text-slate-400 max-w-xs font-medium leading-relaxed italic">
                  Connect to a communication node from the left pane to initialize inquiry audit.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </StandardPage>
  )
}
