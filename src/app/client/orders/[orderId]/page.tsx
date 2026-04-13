'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Calendar as CalendarIcon, 
  Target, 
  Send, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  ExternalLink,
  User,
  Zap,
  Phone,
  Layout,
  Plus,
  AlertCircle,
  MoreVertical,
  CheckCircle,
  XCircle,
  Play,
  ArrowRight,
  MoreHorizontal,
  CheckSquare,
  Square
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { JoinZoomButton } from '@/components/JoinZoomButton'
import { getSocket } from '@/lib/socket-client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function OrderDetails() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('messages')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchOrder()
    fetchReservations()
    fetchMessages()

    const socket = getSocket()
    if (socket) {
      socket.emit('join:order', orderId)
      
      const handleNewMessage = (message: any) => {
        if (message.orderId === orderId) {
          setMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev
            return [...prev, message]
          })
          fetchOrder()
        }
      }

      socket.on('new_message', handleNewMessage)

      const handleGlobalNotification = (e: any) => {
        const detail = e.detail
        if (detail?.orderId === orderId) {
          if (detail?.type === 'RESERVATION') fetchReservations()
          else if (detail?.type === 'ORDER' || detail?.type === 'MISSION') fetchOrder()
        }
      }
      window.addEventListener('notification', handleGlobalNotification)

      return () => {
        socket.off('new_message', handleNewMessage)
        window.removeEventListener('notification', handleGlobalNotification)
      }
    }
  }, [orderId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activeTab])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}`)
      if (res.status === 403) {
        router.push('/client')
        return
      }
      const data = await res.json()
      setOrder(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const fetchReservations = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}/reservations`)
      const data = await res.json()
      setReservations(data)
    } catch (error) { console.error(error) }
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}/messages`)
      const data = await res.json()
      setMessages(data)
    } catch (error) { console.error(error) }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      await fetch(`/api/client/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      })
      setNewMessage('')
      fetchMessages()
      fetchOrder()
    } catch (error) { console.error(error) }
    finally { setSending(false) }
  }

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      // Optimistic update
      setOrder(prev => {
        if (!prev) return prev
        return {
          ...prev,
          missions: prev.missions.map((m: any) => ({
            ...m,
            milestones: m.milestones.map((ms: any) => 
              ms.id === milestoneId ? { ...ms, status } : ms
            )
          }))
        }
      })

      const res = await fetch('/api/client/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, status })
      })
      if (!res.ok) {
        toast.error('Failed to update status')
        fetchOrder() // Revert
      }
    } catch (error) { 
      console.error(error)
      fetchOrder() // Revert
    }
  }

  const canJoin = (reservation: any) => {
    const now = new Date()
    const start = new Date(reservation.startTime)
    const end = new Date(reservation.endTime)
    const earlyAccessMs = 15 * 60 * 1000 
    return now.getTime() >= (start.getTime() - earlyAccessMs) && now.getTime() <= end.getTime()
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Synchronizing Workspace...</p>
      </div>
    </div>
  )

  if (!order) return <div className="p-20 text-center font-bold">Subscription not found.</div>

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 lg:p-12 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Workspace Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col gap-2">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors tracking-widest mb-2 font-sans">
              <ChevronLeft className="w-4 h-4" /> Back to orders
            </button>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none font-sans">
              {order.serviceTier?.service?.name || 'Consulting Stream'}
            </h1>
            <p className="text-sm md:text-md font-bold text-slate-400 mt-2 uppercase tracking-widest font-sans">
              Digital Workspace & Collaboration Center
            </p>
          </div>
          
          <Card className="border-none shadow-xl shadow-blue-100/40 rounded-3xl bg-white px-8 py-4 flex items-center gap-6">
            <div className="flex items-center gap-4 pr-6 border-r border-slate-100">
               <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-2 ring-blue-50">
                  <AvatarImage src={order.consultant?.image} />
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-xs uppercase">
                    {order.consultant?.name?.substring(0, 2) || 'EX'}
                  </AvatarFallback>
               </Avatar>
               <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 font-sans">Expert Assigned</p>
                  <p className="text-sm font-black text-slate-900 leading-none font-sans">{order.consultant?.name || 'Assigned Pending'}</p>
               </div>
            </div>
            <div>
               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 font-sans">Status</p>
               <Badge className={cn(
                  "border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full font-sans",
                  order.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-600 shadow-sm" : "bg-slate-100 text-slate-500"
               )}>
                  {order.status}
               </Badge>
            </div>
          </Card>
        </header>

        {/* Workspace Content */}
        <Tabs defaultValue="messages" className="w-full space-y-8 min-h-[600px] flex flex-col" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
             <TabsList className="bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200">
                <TabsTrigger value="messages" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans">
                   Messages
                </TabsTrigger>
                <TabsTrigger value="reservations" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans">
                   Reservations
                </TabsTrigger>
                <TabsTrigger value="missions" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans">
                   Missions
                </TabsTrigger>
             </TabsList>
             
             <div className="hidden md:flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4" /> Usage: {order.callMinutesUsed} / {order.serviceTier?.maxCallDuration || '∞'}m
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-2">
                   <MessageSquare className="w-4 h-4" /> Chat: {order.messagesUsed} / {order.serviceTier?.maxMessages || '∞'}
                </div>
             </div>
          </div>

          <div className="flex-1 min-h-[500px] bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl relative overflow-hidden flex flex-col">
             
             <TabsContent value="messages" className="m-0 flex-1 flex flex-col focus-visible:ring-0">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 scroll-smooth">
                   {messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
                           <MessageSquare className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight font-sans">No transmissions yet</h3>
                        <p className="text-sm font-bold text-slate-500 max-w-xs font-sans">Start a conversation with your consultant regarding your objectives.</p>
                     </div>
                   ) : (
                     messages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={cn(
                            "flex flex-col max-w-[90%] md:max-w-[70%]",
                            msg.senderType === 'CLIENT' ? "ml-auto items-end" : "items-start"
                          )}
                        >
                           <div className={cn(
                             "p-4 md:p-6 rounded-[1.8rem] text-sm md:text-[15px] font-medium leading-relaxed shadow-sm font-sans",
                             msg.senderType === 'CLIENT' ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100/50" : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                           )}>
                              {msg.content}
                           </div>
                           <span className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest px-2 opacity-60 font-sans">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                     ))
                   )}
                </div>
                
                {order.status === 'ACTIVE' && (
                  <footer className="p-4 md:p-8 bg-white border-t border-slate-100 flex gap-4">
                     <div className="flex-1">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Compose your message..."
                          className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                          disabled={sending}
                        />
                     </div>
                     <Button 
                       onClick={sendMessage}
                       disabled={sending || !newMessage.trim()}
                       className="h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center shrink-0"
                     >
                       <Send className="w-5 h-5" />
                     </Button>
                  </footer>
                )}
             </TabsContent>

             <TabsContent value="reservations" className="m-0 flex-1 p-4 md:p-12 focus-visible:ring-0 overflow-y-auto">
                <div className="flex flex-col h-full gap-8"> 
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Meeting Timeline</h3>
                         <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest font-sans">Scheduled consulting sessions & reviews</p>
                      </div>
                      <Link href="/client/services">
                         <Button className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl px-10 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-100 transition-all active:scale-95 font-sans">
                           <Plus className="w-4 h-4 mr-2" /> Book Session
                         </Button>
                      </Link>
                   </div>

                   {reservations.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
                           <CalendarIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight font-sans">No sessions booked</h3>
                        <p className="text-sm font-bold text-slate-500 max-w-xs font-sans">You haven't scheduled any face-to-face sessions yet.</p>
                     </div>
                   ) : (
                     <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 bg-white shadow-sm font-sans">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50/50">
                              <tr>
                                 <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Agenda Item</th>
                                 <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                                 <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                 <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Engagement</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {reservations.map((res) => (
                                 <tr key={res.id} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6 text-sm">
                                       <div className="flex items-center gap-6">
                                          <div className="h-14 w-14 rounded-3xl bg-slate-100/50 flex flex-col items-center justify-center leading-none text-slate-900 border border-slate-200/40">
                                            <span className="text-[9px] font-black uppercase mb-1">{new Date(res.startTime).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-xl font-black">{new Date(res.startTime).getDate()}</span>
                                          </div>
                                          <div>
                                             <p className="font-black text-slate-900 text-lg mb-1 font-sans">Consulting Review</p>
                                             <p className="text-xs font-bold text-slate-400 tracking-tight uppercase font-sans">
                                               {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                             </p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                       <Badge className={cn(
                                         "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none font-sans",
                                         res.meetingType === 'SUR_PLACE' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                       )}>
                                          {res.meetingType === 'SUR_PLACE' ? 'Physical' : 'Digital'}
                                       </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-center font-sans">
                                       <div className="flex flex-col items-center gap-1">
                                          <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            res.status === 'CONFIRMED' ? "text-emerald-500" : res.status === 'PENDING' ? "text-amber-500" : "text-slate-400"
                                          )}>
                                             {res.status}
                                          </span>
                                          {res.status === 'PENDING' && <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" />}
                                       </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-sans">
                                       {res.status === 'CONFIRMED' && res.zoomJoinUrl ? (
                                          canJoin(res) ? (
                                             <JoinZoomButton joinUrl={res.zoomJoinUrl} />
                                          ) : (
                                             <span className="text-[10px] font-black text-slate-300 italic">Available during session</span>
                                          )
                                       ) : (
                                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Session Locked</span>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                   )}
                </div>
             </TabsContent>

             <TabsContent value="missions" className="m-0 flex-1 p-4 md:p-12 focus-visible:ring-0 overflow-y-auto">
                <div className="flex flex-col h-full gap-8">
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Operational Missions</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest font-sans">Track milestone completion & project goals</p>
                   </div>

                   {!order.missions || order.missions.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
                           <Target className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight font-sans">No active missions</h3>
                        <p className="text-sm font-bold text-slate-500 max-w-xs font-sans">Specific objectives will be listed here as the consulting proceeds.</p>
                     </div>
                   ) : (
                     <div className="space-y-12 pb-10">
                        {order.missions.map((mission: any) => {
                           const total = mission.milestones?.length || 0
                           const completed = mission.milestones?.filter((m: any) => m.status === 'COMPLETED').length || 0
                           const progressValue = total > 0 ? (completed / total) * 100 : 0

                           return (
                              <section key={mission.id} className="space-y-6">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                                          <Target className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <h4 className="text-xl font-black text-slate-900 font-sans">{mission.title}</h4>
                                          <div className="flex items-center gap-3 mt-1">
                                             <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-md">{mission.status}</Badge>
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{completed}/{total} Milestones Achieved</span>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Mission Progress</p>
                                       <p className="text-lg font-black text-blue-600 tracking-tight">{Math.round(progressValue)}%</p>
                                    </div>
                                 </div>

                                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${progressValue}%` }}
                                       transition={{ duration: 1.5, ease: "easeOut" }}
                                       className="h-full bg-blue-600 rounded-full"
                                     />
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
                                             <Card 
                                               key={m.id} 
                                               draggable
                                               onDragStart={(e) => e.dataTransfer.setData('milestoneId', m.id)}
                                               className={cn(
                                                 "border-none shadow-sm rounded-2xl p-5 cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] active:scale-[0.98] border-2 flex-shrink-0",
                                                 m.status === 'COMPLETED' ? "bg-emerald-50/30 border-emerald-100" : m.status === 'IN_PROGRESS' ? "bg-blue-50/30 border-blue-100" : "bg-white border-slate-50 shadow-slate-100/50 hover:shadow-md"
                                               )}
                                             >
                                                <div className="flex items-start gap-4 pointer-events-none">
                                                   <div className={cn(
                                                     "h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border-2 mt-0.5 transition-colors",
                                                     m.status === 'COMPLETED' ? "bg-emerald-500 border-emerald-500" : m.status === 'IN_PROGRESS' ? "border-blue-500" : "bg-white border-slate-200"
                                                   )}>
                                                      {m.status === 'COMPLETED' ? <CheckSquare className="w-4 h-4 text-white" /> : m.status === 'IN_PROGRESS' ? <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> : <Square className="w-4 h-4 text-slate-100" />}
                                                   </div>
                                                   <div className="flex-1 min-w-0">
                                                      <p className={cn(
                                                        "text-sm font-bold font-sans leading-tight",
                                                        m.status === 'COMPLETED' ? "text-emerald-800 line-through opacity-80" : "text-slate-900"
                                                      )}>
                                                         {m.title}
                                                      </p>
                                                      {m.dueDate && (
                                                         <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-2 flex items-center gap-1.5">
                                                            <Clock className="w-2.5 h-2.5" /> Due {new Date(m.dueDate).toLocaleDateString()}
                                                         </p>
                                                      )}
                                                   </div>
                                                </div>
                                             </Card>
                                          ))}
                                          {mission.milestones?.filter((m: any) => m.status === colStatus).length === 0 && (
                                             <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl mt-2 pointer-events-none">
                                                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest px-4 text-center">Drop here</span>
                                             </div>
                                          )}
                                       </div>
                                    ))}
                                 </div>

                              </section>
                           )
                        })}
                     </div>
                   )}
                </div>
             </TabsContent>

          </div>
        </Tabs>

      </div>
      
      {/* Background Ambience */}
      <div className="fixed top-[-200px] right-[-100px] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-100px] left-[300px] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
    </div>
  )
}
