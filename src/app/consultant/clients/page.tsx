'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MessageSquare, Briefcase, Phone, Calendar, 
  Send, Plus, Trash2, Edit3, CheckCircle2, 
  Clock, AlertCircle, ChevronRight, MoreVertical,
  ExternalLink, User, Filter, CheckCircle, XCircle, Play, Menu, X, ChevronLeft,
  Layout, CalendarDays, Target, CheckSquare, Trash, AlertTriangle
} from 'lucide-react'
import { getSocket } from '@/lib/socket-client'
import { toast } from 'react-hot-toast'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export default function ConsultantClients() {
  const [activeTab, setActiveTab] = useState<'messages' | 'missions' | 'calls' | 'reservations'>('messages')
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [missions, setMissions] = useState<any[]>([])
  const [calls, setCalls] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Modals state
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false)
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<string | null>(null)
  
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null)
  const [deleteContext, setDeleteContext] = useState<{ id: string, type: 'mission' | 'milestone' } | null>(null)
  
  const [missionForm, setMissionForm] = useState({ title: '', description: '' })
  const [milestoneForm, setMilestoneForm] = useState({ title: '' })

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      const clientData = clients.find(c => c.id === selectedClient)
      fetchMessages(selectedClient)
      fetchMissions(selectedClient)
      fetchCalls(selectedClient)
      if (clientData?.clientId) {
        fetchReservations(clientData.clientId)
      }

      const socket = getSocket()
      const handleNewMessage = (message: any) => {
        if (message.orderId === selectedClient) {
          setMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev
            return [...prev, message]
          })
        }
        setClients(prev => prev.map(c => {
          if (c.id === message.orderId) {
            return { ...c, messagesUsed: (c.messagesUsed || 0) + 1 }
          }
          return c
        }))
      }

      if (socket) {
        socket.emit('join:order', selectedClient)
        socket.on('new_message', handleNewMessage)
      }

      const handleGlobalNotification = (e: any) => {
        const detail = e.detail
        if (detail?.orderId === selectedClient) {
          if (detail?.type === 'ORDER_MESSAGE' || detail?.type === 'MESSAGE') {
            fetchMessages(selectedClient)
          } else if (detail?.type === 'RESERVATION') {
            const clientData = clients.find(c => c.id === selectedClient)
            if (clientData?.clientId) fetchReservations(clientData.clientId)
          } else if (detail?.type === 'MISSION') {
            fetchMissions(selectedClient)
          }
        }
      }
      window.addEventListener('notification', handleGlobalNotification)

      return () => {
        window.removeEventListener('notification', handleGlobalNotification)
        if (socket) socket.off('new_message', handleNewMessage)
      }
    }
  }, [selectedClient, clients])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/consultant/clients')
      const data = await res.json()
      setClients(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const fetchMessages = async (orderId: string) => {
    try {
      const res = await fetch(`/api/consultant/messages?orderId=${orderId}`)
      const data = await res.json()
      setMessages(data)
    } catch (error) { console.error(error) }
  }

  const fetchCalls = async (orderId: string) => {
    try {
      const res = await fetch(`/api/consultant/calls?orderId=${orderId}`)
      const data = await res.json()
      setCalls(data)
    } catch (error) { console.error(error) }
  }

  const fetchMissions = async (orderId: string) => {
    try {
      const res = await fetch(`/api/consultant/missions?orderId=${orderId}`)
      const data = await res.json()
      setMissions(data)
    } catch (error) { console.error(error) }
  }

  const fetchReservations = async (clientId: string) => {
    try {
      const res = await fetch(`/api/consultant/reservations?clientId=${clientId}`)
      const data = await res.json()
      setReservations(data)
    } catch (error) { console.error(error) }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return
    try {
      await fetch('/api/consultant/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedClient, content: newMessage })
      })
      setNewMessage('')
      fetchMessages(selectedClient)
    } catch (error) { console.error(error) }
  }

  const handleCreateMission = async () => {
    if (!selectedClient || !missionForm.title.trim()) return
    try {
      const res = await fetch('/api/consultant/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: selectedClient, 
          title: missionForm.title,
          description: missionForm.description 
        })
      })
      if (res.ok) {
        setIsMissionModalOpen(false)
        setMissionForm({ title: '', description: '' })
        fetchMissions(selectedClient)
      }
    } catch (error) { console.error(error) }
  }

  const handleCreateMilestone = async () => {
    if (!activeMissionId || !milestoneForm.title.trim()) return
    try {
      const res = await fetch('/api/consultant/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          missionId: activeMissionId, 
          title: milestoneForm.title
        })
      })
      if (res.ok) {
        setIsMilestoneModalOpen(false)
        setMilestoneForm({ title: '' })
        if (selectedClient) fetchMissions(selectedClient)
      }
    } catch (error) { console.error(error) }
  }

  const updateMissionStatus = async (missionId: string, status: string) => {
    const mission = missions.find(m => m.id === missionId)
    if (!mission) return
    try {
      await fetch('/api/consultant/missions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, title: mission.title, description: mission.description, status })
      })
      if (selectedClient) fetchMissions(selectedClient)
    } catch (error) { console.error(error) }
  }

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      await fetch('/api/consultant/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, status })
      })
      if (selectedClient) fetchMissions(selectedClient)
    } catch (error) { console.error(error) }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log('Attempting to update order status:', orderId, status)
      const res = await fetch(`/api/consultant/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setIsStatusModalOpen(false)
        setTargetStatus(null)
        fetchClients()
        toast.success(`Order ${status.toLowerCase()} successfully`)
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Failed to update order status')
      }
    } catch (error) { 
      console.error('Order status update error:', error)
      toast.error('A connection error occurred')
    }
  }

  const performDelete = async () => {
    if (!deleteContext) return
    try {
      const endpoint = deleteContext.type === 'mission' ? '/api/consultant/missions' : '/api/consultant/milestones'
      const body = deleteContext.type === 'mission' ? { missionId: deleteContext.id } : { milestoneId: deleteContext.id }
      
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        setIsDeleteModalOpen(false)
        setDeleteContext(null)
        if (selectedClient) fetchMissions(selectedClient)
      }
    } catch (error) { console.error(error) }
  }

  const filteredClients = clients.filter(c => 
    (c.client.name || c.client.email).toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.serviceTier.service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedClientData = clients.find(c => c.id === selectedClient)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 font-sans">Wait a moment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col md:flex-row overflow-hidden font-sans relative">
      
      {/* Mobile Sidebar Trigger (Floating) */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 md:hidden bg-emerald-600 text-white border-none hover:bg-emerald-700 active:scale-95 transition-all"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar Overlay (Mobile only) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar: Client List */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? (window.innerWidth < 768 ? '85%' : '340px') : '0px',
          x: sidebarOpen ? 0 : (window.innerWidth < 768 ? -400 : 0),
          opacity: sidebarOpen ? 1 : 0 
        }}
        className={cn(
          "bg-white border-r border-slate-200/60 shadow-2xl md:shadow-none flex flex-col z-40 fixed md:relative inset-y-0 left-0 transition-shadow",
          !sidebarOpen && "pointer-events-none"
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layout className="h-5 w-5 text-emerald-600" />
              Clients
            </h1>
            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">
              {clients.length}
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search workspaces..." 
              className="pl-10 h-10 bg-slate-50/80 border-slate-100 rounded-2xl focus-visible:ring-emerald-500 transition-all text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-1.5 pb-10">
            {filteredClients.map(client => (
              <button
                key={client.id}
                onClick={() => {
                  setSelectedClient(client.id)
                  if (window.innerWidth < 768) setSidebarOpen(false)
                }}
                className={cn(
                  "group w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-300 relative",
                  selectedClient === client.id 
                    ? "bg-white shadow-lg shadow-emerald-100/40 ring-1 ring-emerald-100" 
                    : "hover:bg-slate-50/80 active:scale-98"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarImage src={client.client.image} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xs uppercase">
                      {(client.client.name || client.client.email).substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {client.status === 'ACTIVE' && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className={cn(
                    "font-bold text-sm truncate",
                    selectedClient === client.id ? "text-slate-950" : "text-slate-700"
                  )}>
                    {client.client.name || client.client.email}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate mt-0.5">
                    {client.serviceTier.service.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </motion.aside>

      {/* Sidebar Collapse Toggle (Desktop) */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-[22px] bg-white border border-slate-200 p-1.5 rounded-r-xl shadow-lg z-50 hidden md:flex hover:bg-slate-50 transition-all hover:pl-2.5 active:scale-90"
        style={{ left: sidebarOpen ? '340px' : '0px', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {sidebarOpen ? <ChevronLeft className="h-4 w-4 text-slate-600" /> : <ChevronRight className="h-4 w-4 text-slate-600" />}
      </button>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col bg-[#F8FAFC] min-w-0 h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          {selectedClient ? (
            <motion.div
              key={selectedClient}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full flex flex-col"
            >
              {/* Client Profile Header */}
              <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md z-20 shrink-0">
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-10 w-10 border border-slate-200">
                    <AvatarImage src={selectedClientData?.client.image} />
                    <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">
                      {(selectedClientData?.client.name || selectedClientData?.client.email).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-slate-900 truncate leading-tight">{selectedClientData?.client.name || 'Client'}</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedClientData?.client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[9px] font-black uppercase px-2 py-0.5">
                    {selectedClientData?.serviceTier.tierType}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 group outline-none">
                        <Badge className={cn(
                          "border-none text-[9px] font-black uppercase px-2 py-0.5 cursor-pointer transition-all group-hover:scale-105 active:scale-95",
                          selectedClientData?.status === 'ACTIVE' ? "bg-emerald-600 text-white shadow-emerald-100 shadow-md" : 
                          selectedClientData?.status === 'COMPLETED' ? "bg-blue-600 text-white shadow-blue-100 shadow-md" :
                          selectedClientData?.status === 'PENDING' ? "bg-amber-500 text-white shadow-amber-100 shadow-md" :
                          "bg-slate-200 text-slate-500"
                        )}>
                          {selectedClientData?.status}
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-1.5 w-40 bg-white/95 backdrop-blur-md">
                      {['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
                        <DropdownMenuItem 
                          key={status}
                          onClick={() => {
                            if (status !== selectedClientData?.status) {
                              setTargetStatus(status)
                              setIsStatusModalOpen(true)
                            }
                          }}
                          className={cn(
                            "rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all",
                            status === selectedClientData?.status ? "bg-slate-50 text-slate-400 pointer-events-none" : "hover:bg-slate-50 text-slate-700"
                          )}
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>

              {/* Functional Navigation Tabs */}
              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col min-h-0 bg-[#FBFDFF]">
                <div className="px-6 py-3 border-b border-slate-200/50 bg-white/50 overflow-x-auto no-scrollbar">
                  <TabsList className="bg-slate-100/50 h-10 p-1 rounded-2xl w-fit flex gap-1 border border-slate-100">
                    <TabsTrigger value="messages" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-xl py-1.5 px-4 text-[11px] font-black uppercase tracking-widest transition-all">
                      <MessageSquare className="h-3.5 w-3.5" /> Messages
                    </TabsTrigger>
                    <TabsTrigger value="missions" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-xl py-1.5 px-4 text-[11px] font-black uppercase tracking-widest transition-all">
                      <Briefcase className="h-3.5 w-3.5" /> Missions
                    </TabsTrigger>
                    <TabsTrigger value="calls" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-xl py-1.5 px-4 text-[11px] font-black uppercase tracking-widest transition-all">
                      <Phone className="h-3.5 w-3.5" /> Calls
                    </TabsTrigger>
                    <TabsTrigger value="reservations" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-xl py-1.5 px-4 text-[11px] font-black uppercase tracking-widest transition-all">
                      <Calendar className="h-3.5 w-3.5" /> Reservations
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 relative min-h-0">
                  <ScrollArea className="h-full">
                    <div className="p-6 lg:p-10 w-full max-w-5xl mx-auto">
                      
                      <TabsContent value="messages" className="m-0 focus-visible:ring-0">
                        <div className="flex flex-col h-[calc(100vh-280px)] bg-white rounded-[2rem] border border-slate-200/60 shadow-xl overflow-hidden">
                          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#F9FBFF]">
                            {messages.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-sm">
                                <MessageSquare className="h-12 w-12 mb-3" />
                                <p>Open a conversation with this client.</p>
                              </div>
                            ) : (
                              messages.map((msg) => (
                                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.senderType === 'CONSULTANT' ? "ml-auto items-end" : "items-start")}>
                                  <div className={cn(
                                    "p-4 rounded-2xl md:rounded-[1.5rem] text-sm md:text-md shadow-sm",
                                    msg.senderType === 'CONSULTANT' ? "bg-emerald-600 text-white rounded-tr-none shadow-emerald-100" : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                                  )}>
                                    {msg.content}
                                  </div>
                                  <span className="text-[9px] text-slate-400 mt-2 font-black uppercase tracking-[0.2em] px-2">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                          <footer className="p-4 bg-white border-t border-slate-100 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                            <Input 
                              placeholder="Type something amazing..." 
                              className="flex-1 h-12 rounded-2xl border-slate-200 bg-slate-50/50 px-6 focus-visible:ring-emerald-500 font-medium"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <Button onClick={sendMessage} className="h-12 w-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center shrink-0">
                              <Send className="h-5 w-5 text-white" />
                            </Button>
                          </footer>
                        </div>
                      </TabsContent>

                      <TabsContent value="missions" className="m-0 focus-visible:ring-0">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                            Ongoing Missions
                          </h3>
                          <Dialog open={isMissionModalOpen} onOpenChange={setIsMissionModalOpen}>
                            <DialogTrigger asChild>
                              <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl px-5 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100">
                                <Plus className="h-4 w-4 mr-2" /> New Mission
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl border-none shadow-2xl p-8 bg-white max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900">Create New Mission</DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium pt-2">
                                  Define a new high-impact mission for your client.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6 pt-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mission Title</label>
                                  <Input 
                                    placeholder="e.g. Q2 Performance Audit" 
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus-visible:ring-emerald-500"
                                    value={missionForm.title}
                                    onChange={(e) => setMissionForm({...missionForm, title: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Objectives & Scope</label>
                                  <Textarea 
                                    placeholder="Briefly describe the mission goals..." 
                                    className="rounded-2xl bg-slate-50 border-slate-100 focus-visible:ring-emerald-500 min-h-[100px]"
                                    value={missionForm.description}
                                    onChange={(e) => setMissionForm({...missionForm, description: e.target.value})}
                                  />
                                </div>
                              </div>
                              <DialogFooter className="pt-8 block">
                                <Button 
                                  onClick={handleCreateMission}
                                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black uppercase tracking-widest"
                                >
                                  Initialize Mission
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          {missions.map(mission => (
                            <Card key={mission.id} className="border border-slate-200 shadow-xl shadow-slate-200/30 rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl transition-all">
                              <CardHeader className="bg-slate-50/60 p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] px-3 py-1 bg-emerald-50 w-fit rounded-full">Ref: {mission.id.slice(-6)}</div>
                                      {mission.status === 'COMPLETED' && (
                                        <Badge className="bg-emerald-600 text-white border-none text-[9px] uppercase font-black">Success</Badge>
                                      )}
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900">{mission.title}</h4>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <select
                                      value={mission.status}
                                      onChange={(e) => updateMissionStatus(mission.id, e.target.value)}
                                      className="bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer h-10"
                                    >
                                      <option value="PENDING">Pending</option>
                                      <option value="IN_PROGRESS">Progress</option>
                                      <option value="COMPLETED">Completed</option>
                                    </select>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => {
                                        setDeleteContext({ id: mission.id, type: 'mission' })
                                        setIsDeleteModalOpen(true)
                                      }}
                                      className="h-10 w-10 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-8 border-t border-slate-100">
                                {mission.description && (
                                  <p className="text-sm text-slate-500 mb-8 font-medium italic leading-relaxed">"{mission.description}"</p>
                                )}
                                
                                <div className="space-y-6">
                                  <div className="flex items-center justify-between">
                                    <h5 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                      <Target className="h-4 w-4 text-emerald-500" /> 
                                      Execution Tasks
                                    </h5>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-emerald-600 hover:bg-emerald-50 font-black text-[10px] uppercase tracking-widest h-8 rounded-lg"
                                      onClick={() => {
                                        setActiveMissionId(mission.id)
                                        setIsMilestoneModalOpen(true)
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add Task
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(colStatus => (
                                      <div 
                                        key={colStatus} 
                                        className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100 min-h-[300px]"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                           e.preventDefault();
                                           const milestoneId = e.dataTransfer.getData('milestoneId');
                                           if (milestoneId) {
                                             updateMilestoneStatus(milestoneId, colStatus);
                                           }
                                        }}
                                      >
                                        <div className="flex items-center justify-between mb-2 px-2">
                                          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{colStatus.replace('_', ' ')}</h5>
                                          <Badge className="bg-white text-slate-900 border-none shadow-sm shadow-slate-200/50">
                                            {mission.milestones?.filter((m: any) => m.status === colStatus).length || 0}
                                          </Badge>
                                        </div>
                                        {mission.milestones?.filter((m: any) => m.status === colStatus).map((m: any) => (
                                          <div 
                                            key={m.id} 
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData('milestoneId', m.id)}
                                            className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col gap-3 shadow-sm group hover:border-emerald-200 transition-all flex-shrink-0 cursor-grab active:cursor-grabbing"
                                          >
                                            <div className="flex items-start justify-between pointer-events-none">
                                              <span className={cn("text-xs font-bold leading-tight flex-1", m.status === 'COMPLETED' ? "text-slate-400 line-through opacity-80" : "text-slate-900")}>
                                                {m.title}
                                              </span>
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setDeleteContext({ id: m.id, type: 'milestone' })
                                                  setIsDeleteModalOpen(true)
                                                }}
                                                className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all shrink-0 ml-2 pointer-events-auto"
                                              >
                                                <Trash className="h-3 w-3" />
                                              </Button>
                                            </div>
                                            <div className="flex items-center justify-start">
                                              <select
                                                value={m.status}
                                                onChange={(e) => updateMilestoneStatus(m.id, e.target.value)}
                                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600 focus:ring-1 focus:ring-emerald-500 cursor-pointer w-full pointer-events-auto"
                                                onClick={e => e.stopPropagation()}
                                              >
                                                <option value="PENDING">Pending</option>
                                                <option value="IN_PROGRESS">Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                              </select>
                                            </div>
                                          </div>
                                        ))}
                                        {mission.milestones?.filter((m: any) => m.status === colStatus).length === 0 && (
                                          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl mt-2 p-2 pointer-events-none">
                                            <span className="text-[9px] font-bold uppercase text-slate-300 tracking-widest text-center">Drop here</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>


                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {/* Task Modal */}
                        <Dialog open={isMilestoneModalOpen} onOpenChange={setIsMilestoneModalOpen}>
                          <DialogContent className="rounded-3xl border-none shadow-2xl p-8 bg-white max-w-sm">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black text-slate-900">Add Tactical Task</DialogTitle>
                              <DialogDescription className="text-slate-500 font-medium">Defined for the active mission segment.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <Input 
                                placeholder="e.g. Initial data collection..." 
                                className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus-visible:ring-emerald-500 font-bold text-sm"
                                value={milestoneForm.title}
                                onChange={(e) => setMilestoneForm({ title: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateMilestone()}
                              />
                            </div>
                            <DialogFooter className="pt-6">
                              <Button 
                                onClick={handleCreateMilestone}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-100"
                              >
                                Create Task
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TabsContent>

                      <TabsContent value="calls" className="m-0 focus-visible:ring-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {calls.length === 0 ? (
                            <div className="col-span-full py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                              <Phone className="h-16 w-16 mb-6 opacity-20" />
                              <p className="font-black uppercase text-[11px] tracking-[0.3em]">No voice records yet</p>
                            </div>
                          ) : (
                            calls.map(call => (
                              <div key={call.id} className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 group hover:-translate-y-2 transition-all duration-300">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                                  <Phone className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="font-black text-slate-900 text-lg mb-1">{new Date(call.startedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">{call.duration} Minutes of Discussion</p>
                                {call.recordingUrl && (
                                  <Button asChild className="w-full h-11 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg">
                                    <a href={call.recordingUrl} target="_blank"><Play className="h-4 w-4 fill-current" /> Playback Session</a>
                                  </Button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="reservations" className="m-0 focus-visible:ring-0">
                        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200/50">
                          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Appointments</h3>
                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold italic">{reservations.length} total</Badge>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50/50">
                                <tr className="border-b border-slate-100">
                                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Agenda Item</th>
                                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Engagement</th>
                                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {reservations.map(res => (
                                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-8">
                                      <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-3xl bg-emerald-100 flex flex-col items-center justify-center leading-none text-emerald-800 shadow-inner">
                                          <span className="text-[10px] font-black uppercase mb-1">{new Date(res.startTime).toLocaleString('default', { month: 'short' })}</span>
                                          <span className="text-xl font-black">{new Date(res.startTime).getDate()}</span>
                                        </div>
                                        <div>
                                          <p className="text-lg font-black text-slate-950">{res.serviceTier.service.name}</p>
                                          <p className="text-xs text-slate-400 font-bold tracking-tight">Starts @ {new Date(res.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-8 py-8">
                                      <div className="flex justify-center">
                                        {res.status === 'CONFIRMED' && res.zoomJoinUrl ? (
                                          <Button asChild size="sm" className="bg-slate-950 hover:bg-emerald-600 rounded-2xl px-8 font-black text-[10px] uppercase transition-all shadow-lg hover:shadow-emerald-200">
                                            <a href={res.zoomJoinUrl} target="_blank">Access Meeting</a>
                                          </Button>
                                        ) : (
                                          <span className="text-xs text-slate-400 font-medium italic opacity-50">No link issued</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                      <Badge className={cn("rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm", res.status === 'CONFIRMED' ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-500 border-none")}>
                                        {res.status}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TabsContent>

                    </div>
                  </ScrollArea>
                </div>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#F8FAFC]"
            >
              <div className="relative group cursor-pointer" onClick={() => setSidebarOpen(true)}>
                <div className="absolute inset-0 bg-emerald-400/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all" />
                <div className="relative h-40 w-40 rounded-[3.5rem] bg-white shadow-2xl flex items-center justify-center border border-emerald-50">
                  <User className="h-16 w-16 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-4xl font-black text-slate-900 mt-12 mb-4 tracking-tight">Workstations</h3>
              <p className="text-slate-500 max-w-sm mx-auto leading-relaxed text-md font-medium px-4">
                Select a client from your roster to initialize the workspace. 
                Manage missions, voice logs, and upcoming consultations in real-time.
              </p>
              {!sidebarOpen && (
                <Button 
                  onClick={() => setSidebarOpen(true)}
                  className="mt-12 bg-slate-950 hover:bg-emerald-600 rounded-3xl h-14 px-12 font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all"
                >
                  Retrieve Client Roster
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Dialogs */}
        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 bg-white max-w-sm overflow-hidden">
            <div className="p-8 pb-4 text-center">
              <div className="h-20 w-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 mb-2">Are you sure?</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium leading-relaxed px-4">
                This action is permanent and will remove this {deleteContext?.type} from the client history.
              </DialogDescription>
            </div>
            <div className="p-8 flex flex-col gap-3">
              <Button 
                onClick={performDelete}
                className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                Yes, Delete Forever
              </Button>
              <Button 
                variant="ghost"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setDeleteContext(null)
                }}
                className="w-full h-12 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all"
              >
                Cancel Action
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Status Change Confirmation Modal */}
        <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
          <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 bg-white max-w-sm overflow-hidden">
            <div className="p-8 pb-4 text-center">
              <div className={cn(
                "h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6",
                targetStatus === 'CANCELLED' ? "bg-red-50" : 
                targetStatus === 'ACTIVE' ? "bg-emerald-50" :
                targetStatus === 'COMPLETED' ? "bg-blue-50" : "bg-amber-50"
              )}>
                {targetStatus === 'CANCELLED' ? (
                  <XCircle className="h-10 w-10 text-red-500" />
                ) : targetStatus === 'ACTIVE' ? (
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                ) : targetStatus === 'COMPLETED' ? (
                  <CheckCircle2 className="h-10 w-10 text-blue-500" />
                ) : (
                  <Clock className="h-10 w-10 text-amber-500" />
                )}
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 mb-2">
                Update to {targetStatus}?
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium leading-relaxed px-4">
                Are you sure you want to change this order status to <span className="font-bold text-slate-900">{targetStatus}</span>? This will affect client access and notifications.
              </DialogDescription>
            </div>
            <div className="p-8 flex flex-col gap-3">
              <Button 
                onClick={() => selectedClient && targetStatus && updateOrderStatus(selectedClient, targetStatus)}
                className={cn(
                  "w-full h-14 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95",
                  targetStatus === 'CANCELLED' ? "bg-red-500 hover:bg-red-600 shadow-red-100" : 
                  targetStatus === 'ACTIVE' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" :
                  targetStatus === 'COMPLETED' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100" :
                  "bg-amber-500 hover:bg-amber-600 shadow-amber-100"
                )}
              >
                Yes, Update Status
              </Button>
              <Button 
                variant="ghost"
                onClick={() => {
                  setIsStatusModalOpen(false)
                  setTargetStatus(null)
                }}
                className="w-full h-12 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all"
              >
                Go Back
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      {/* Dynamic Background Elements */}
      <div className="fixed top-[-200px] right-[-100px] w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-100px] left-[300px] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
    </div>
  )
}
