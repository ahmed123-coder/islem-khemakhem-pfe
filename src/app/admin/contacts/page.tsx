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
  AtSign
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

  React.useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/contacts')
      const data = await res.json()
      setContacts(data)
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedContact = contacts.find(c => c.id === selectedId)

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'new': return "bg-amber-50 text-amber-600 border-amber-100"
      case 'read': return "bg-blue-50 text-blue-600 border-blue-100"
      case 'replied': return "bg-emerald-50 text-emerald-600 border-emerald-100"
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filteredContacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => setSelectedId(contact.id)}
                className={cn(
                  "p-4 rounded-3xl border cursor-pointer transition-all duration-300 group relative",
                  selectedId === contact.id 
                    ? "bg-white border-blue-600 shadow-lg shadow-blue-50 ring-4 ring-blue-600/5" 
                    : "bg-white/60 border-transparent hover:bg-white hover:border-slate-100"
                )}
              >
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-600 font-bold text-xs">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-slate-900 truncate text-sm">{contact.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">
                      {contact.message}
                    </p>
                    <Badge className={cn("rounded-lg px-2 py-0 border text-[9px] font-black uppercase tracking-tight", getStatusStyle(contact.status))}>
                      {contact.status}
                    </Badge>
                  </div>
                </div>
                {selectedId === contact.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full" />
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
                  <header className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-5">
                      <Avatar className="w-16 h-16 border-4 border-white shadow-xl">
                        <AvatarFallback className="bg-blue-600 text-white font-black text-xl italic">
                          {selectedContact.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                          {selectedContact.name}
                        </h2>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <AtSign className="w-3.5 h-3.5" /> {selectedContact.email}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {new Date(selectedContact.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="rounded-2xl border-slate-200 h-11 px-6 font-bold text-xs transition-all active:scale-95">
                        <Reply className="w-4 h-4 mr-2 text-blue-600" /> Reply via Email
                      </Button>
                      <Button className="rounded-2xl bg-slate-900 hover:bg-black text-white h-11 px-6 font-bold text-xs shadow-lg shadow-slate-200 transition-all active:scale-95">
                         Mark Processed
                      </Button>
                    </div>
                  </header>

                  {/* Detail Body */}
                  <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    <section>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/60 mb-6 block">Inquiry Metadata</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                           <Badge className={cn("rounded-lg border-none font-black text-[10px] uppercase", getStatusStyle(selectedContact.status))}>
                             {selectedContact.status}
                           </Badge>
                        </div>
                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Source</p>
                           <p className="text-sm font-bold text-slate-900">Contact Form</p>
                        </div>
                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Platform</p>
                           <p className="text-sm font-bold text-slate-900">Web Dashboard</p>
                        </div>
                      </div>
                    </section>

                    <section className="relative">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/60 mb-6 block">Communication Body</label>
                       <div className="relative p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm">
                         <blockquote className="text-lg font-medium text-slate-700 leading-relaxed italic pr-12">
                           "{selectedContact.message}"
                         </blockquote>
                         <div className="absolute top-8 right-8">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                               <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                         </div>
                       </div>
                    </section>
                  </div>

                  {/* Detail Footer */}
                  <footer className="p-8 border-t border-slate-100 bg-slate-50/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal ID: {selectedContact.id.slice(0, 8)}...</span>
                    </div>
                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs">
                      <Trash2 className="w-4 h-4 mr-2" /> Permanently Delete Inquiry
                    </Button>
                  </footer>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-[40px] border border-dashed border-slate-200 bg-slate-50/30">
                <div className="w-20 h-20 rounded-[28px] bg-white flex items-center justify-center shadow-sm mb-6">
                  <Inbox className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Conversation Selected</h3>
                <p className="text-sm text-slate-500 max-w-xs font-medium">
                  Select a contact from the list on the left to view the full message details and take action.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </StandardPage>
  )
}
