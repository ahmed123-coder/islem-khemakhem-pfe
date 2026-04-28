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
  ChevronRight,
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
  Square,
  List,
  Table,
  CalendarDays,
  Menu,
  X,
  Star,
  Pencil
} from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { toast } from 'react-hot-toast'
import { JoinZoomButton } from '@/components/JoinZoomButton'
import { ReviewDialog } from '@/components/reviews/review-dialog'
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
  const [activeTab, setActiveTab] = useState('reservations')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  
  // Grid states from old version
  const [reserving, setReserving] = useState(false)
  const [selectedRes, setSelectedRes] = useState<any>(null)
  const [pendingSlot, setPendingSlot] = useState<{ day: Date; startHour: number; endHour: number } | null>(null)
  const [dragStart, setDragStart] = useState<{ day: Date; hour: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ day: Date; hour: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Start from Monday
    const date = new Date(d.setDate(diff))
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  })

  const SLOTS = Array.from({ length: 36 }, (_, i) => i * 0.25 + 9) // 9:00 to 18:00 in 15min steps
  const DAYS = useMemo(() => {
    const days = []
    const start = new Date(currentWeekStart)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  }, [currentWeekStart])

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
      setReservations(Array.isArray(data) ? data : [])
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

  const bookReservation = async (date: Date, startHour: number, endHour: number, meetingType: 'ZOOM' | 'SUR_PLACE') => {
    if (order.status !== 'ACTIVE' || reserving) return

    const startTime = new Date(date)
    startTime.setHours(Math.floor(startHour), Math.round((startHour % 1) * 60), 0, 0)
    const endTime = new Date(date)
    endTime.setHours(Math.floor(endHour), Math.round((endHour % 1) * 60), 0, 0)

    if (startTime < new Date()) {
      toast.error('Vous ne pouvez pas réserver un créneau dans le passé')
      return
    }

    setReserving(true)
    try {
      const res = await fetch(`/api/client/orders/${orderId}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startTime: startTime.toISOString(), 
          endTime: endTime.toISOString(),
          meetingType
        })
      })
      if (res.ok) {
        toast.success('Réservation demandée au consultant !')
        fetchReservations()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la réservation')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setReserving(false)
    }
  }

  const cancelReservation = async (id: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette session ?')) return
    try {
      const res = await fetch('/api/client/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        toast.success('Réservation annulée')
        fetchReservations()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de l\'annulation')
      }
    } catch (error) {
      console.error(error)
      toast.error('Une erreur est survenue')
    }
  }

  const getReservationAt = (date: Date, slot: number) => {
    return reservations.find(r => {
      const rStart = new Date(r.startTime)
      const rEnd = new Date(r.endTime)
      
      const slotTime = new Date(date)
      slotTime.setHours(Math.floor(slot), Math.round((slot % 1) * 60), 0, 0)
      
      const slotMs = slotTime.getTime()
      return isSameDay(rStart, date) && slotMs >= rStart.getTime() && slotMs < rEnd.getTime()
    })
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

  const changeWeek = (direction: number) => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + direction * 7)
    setCurrentWeekStart(newStart.getTime())
  }

  const getWeekRangeLabel = () => {
    const start = new Date(currentWeekStart)
    const end = new Date(currentWeekStart)
    end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500'
      case 'COMPLETED': return 'bg-blue-500'
      case 'CANCELLED': return 'bg-red-400'
      case 'NO_SHOW': return 'bg-purple-400'
      default: return 'bg-yellow-400' // Pending in yellow as requested
    }
  }

  const getBadgeStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      case 'NO_SHOW': return 'bg-purple-100 text-purple-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">Synchronizing Workspace...</p>
      </div>
    </div>
  )

  if (!order) return <div className="p-20 text-center font-bold">Subscription not found.</div>

  const myReservations = reservations.filter(r => r.orderId === orderId)

  // Logic to determine the next session to book
  const getNextSessionInfo = () => {
    if (!order?.serviceTier) return { label: 'Séance', duration: 1 }
    
    // Example: Discovery (1h), Training (2h), Specialized (3h)
    // We look at the order's tier to decide
    const tier = order.serviceTier.tierType
    const durations: Record<string, number[]> = {
      'DISCOVERY': [1],
      'TRAINING': [2],
      'TRAINING_PLUS': [2, 2],
      'TOTAL_PROJECT': [3, 3, 3]
    }
    
    const sessionDurations = durations[tier] || [1]
    
    // Check how many successful/pending sessions we have
    const activeRes = myReservations.filter(r => 
      ['COMPLETED', 'CONFIRMED', 'PENDING'].includes(r.status)
    ).sort((a, b) => a.sessionIndex - b.sessionIndex)
    
    const nextIndex = activeRes.length
    const duration = sessionDurations[nextIndex] || sessionDurations[sessionDurations.length - 1]
    
    return {
      index: nextIndex,
      label: `Séance ${nextIndex + 1}`,
      duration: duration
    }
  }

  const nextSession = getNextSessionInfo()

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
            <div className="flex flex-col gap-2">
               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 font-sans">Status</p>
               <div className="flex items-center gap-3">
                  <Badge className={cn(
                     "border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full font-sans",
                     order.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-600 shadow-sm" : "bg-slate-100 text-slate-500"
                  )}>
                     {order.status}
                  </Badge>

                  {/* Existing Reviews Display */}
                  {order.reviews && order.reviews.length > 0 && (
                    <div className="flex gap-2 ml-2">
                      {order.reviews.map((review: any) => (
                        <div key={review.id} className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-100 rounded-full px-3 py-1 group/rev cursor-help relative hover:bg-white transition-colors">
                           <div className="flex items-center gap-1.5">
                             <div className="flex items-center gap-0.5">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={cn("w-2 h-2", i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                               ))}
                             </div>
                             <ReviewDialog
                               type={review.type}
                               targetId={order.id}
                               title={review.type === 'SERVICE' ? order.serviceTier.service.name : (order.consultant?.name || "Consultant")}
                               initialRating={review.rating}
                               initialComment={review.comment}
                               reviewId={review.id}
                               onSuccess={fetchOrder}
                               trigger={
                                 <button className="p-0.5 hover:bg-blue-50 rounded transition-colors group/edit">
                                   <Pencil className="w-2 h-2 text-slate-300 group-hover:text-blue-500" />
                                 </button>
                               }
                             />
                           </div>
                           <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">{review.type === 'SERVICE' ? 'Service' : 'Expert'}</span>
                           
                           {review.comment && (
                             <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl opacity-0 group-hover/rev:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl font-sans font-medium leading-relaxed">
                               "{review.comment}"
                               <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900" />
                             </div>
                           )}
                        </div>
                      ))}
                    </div>
                  )}

                  {order.status === 'COMPLETED' && (
                    <div className="flex gap-4">
                      {!order.reviews?.some((r: any) => r.type === 'SERVICE') && (
                        <ReviewDialog 
                          type="SERVICE"
                          targetId={orderId}
                          title={order.serviceTier?.service?.name}
                          onSuccess={fetchOrder}
                          trigger={
                            <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">
                              Évaluer le service
                            </button>
                          }
                        />
                      )}
                      {!order.reviews?.some((r: any) => r.type === 'CONSULTANT') && (
                        <ReviewDialog 
                          type="CONSULTANT"
                          targetId={orderId}
                          title={order.consultant?.name || "Consultant"}
                          onSuccess={fetchOrder}
                          trigger={
                            <button className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">
                              Évaluer l'expert
                            </button>
                          }
                        />
                      )}
                    </div>
                  )}
               </div>
            </div>
          </Card>
        </header>

        {/* Workspace Content */}
        <Tabs value={activeTab} className="w-full space-y-8 min-h-[600px] flex flex-col" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
             <TabsList className="bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200">
                <TabsTrigger value="reservations" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans">
                   Reservations
                </TabsTrigger>
                <TabsTrigger value="messages" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans">
                   Messages
                </TabsTrigger>
                <TabsTrigger value="missions" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans">
                   Missions
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans flex items-center gap-2">
                   Feedback <Badge variant="secondary" className="px-1.5 py-0 bg-blue-50 text-blue-600 border-none text-[8px]">{order.reviews?.length || 0}</Badge>
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
             
             <TabsContent value="reservations" className="m-0 flex-1 p-4 md:p-10 focus-visible:ring-0 overflow-y-auto">
                <div className="space-y-12">
                   
                   {/* Table View of Personal Sessions */}
                   <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-50/50 p-6 border-b border-slate-100">
                         <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight font-sans">Mes Sessions dans cet ordre</h3>
                      </div>
                      {myReservations.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic font-sans font-bold">Aucune session réservée encore pour cet ordre.</div>
                      ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                              <thead className="bg-slate-50/30">
                                 <tr className="border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Heure</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Engagement</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {myReservations.map(reservation => (
                                    <tr key={reservation.id} className="hover:bg-slate-50/30 transition-colors">
                                       <td className="px-8 py-6">
                                          <div className="font-bold text-slate-900 text-sm font-sans">{new Date(reservation.startTime).toLocaleDateString()}</div>
                                          <div className="text-[11px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight font-sans">
                                              {format(new Date(reservation.startTime), 'HH:mm')} – {format(new Date(new Date(reservation.endTime).getTime() - 15 * 60 * 1000), 'HH:mm')}
                                          </div>
                                       </td>
                                       <td className="px-8 py-6">
                                          <Badge className={cn(
                                             "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none font-sans",
                                             reservation.meetingType === 'SUR_PLACE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                          )}>
                                             {reservation.meetingType === 'SUR_PLACE' ? '🏢 Sur Place' : '🎥 Zoom'}
                                          </Badge>
                                       </td>
                                       <td className="px-8 py-6 text-center">
                                          <Badge className={cn(
                                             "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none font-sans",
                                             getBadgeStatusColor(reservation.status)
                                          )}>
                                             {reservation.status}
                                          </Badge>
                                       </td>
                                       <td className="px-8 py-6 text-right font-sans">
                                          {reservation.zoomJoinUrl && reservation.status === 'CONFIRMED' && canJoin(reservation) ? (
                                             <JoinZoomButton joinUrl={reservation.zoomJoinUrl} />
                                          ) : (
                                             <div className="flex flex-col items-end gap-1.5 font-sans">
                                                <span className="text-[10px] text-slate-300 font-bold italic">
                                                     {reservation.status === 'CONFIRMED' ? 'Disponible 15m avant' : (reservation.status === 'COMPLETED' ? 'Session terminée' : 'En attente de confirmation')}
                                                </span>
                                                {reservation.status === 'PENDING' && (
                                                   <button 
                                                      onClick={() => cancelReservation(reservation.id)}
                                                      className="text-[9px] text-red-500 hover:text-red-700 font-black uppercase tracking-widest underline decoration-2 underline-offset-4"
                                                   >
                                                      Annuler la requête
                                                   </button>
                                                )}
                                             </div>
                                          )}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                      )}
                   </div>

                   <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                         <div className="flex flex-col">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight font-sans uppercase">Emploi du temps de l'expert</h2>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest font-sans">Réservez vos créneaux en cliquant sur les espaces vides</p>
                         </div>
                         <div className="flex items-center gap-4 font-sans">
                            <button 
                               onClick={() => changeWeek(-1)}
                               className="p-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all active:scale-95 group"
                            >
                               <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                            </button>
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-6 py-3 rounded-xl border border-slate-200 min-w-[240px] text-center">
                               {getWeekRangeLabel()}
                            </span>
                            <button 
                               onClick={() => changeWeek(1)}
                               className="p-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all active:scale-95 group"
                            >
                               <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                            </button>
                         </div>
                      </div>

                      <div className="overflow-x-auto rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl overflow-hidden font-sans">
                        <table className="w-full border-collapse" onMouseLeave={() => setIsDragging(false)}>
                           <thead className="bg-slate-50/50">
                              <tr className="border-b border-slate-100">
                                 <th className="p-6 text-slate-400 font-black text-[10px] uppercase tracking-widest text-left border-r border-slate-100 sticky left-0 z-20 bg-slate-50/80 backdrop-blur-sm">Jour / Heure</th>
                                 {SLOTS.map(slot => {
                                    const isHour = slot % 1 === 0
                                    return (
                                       <th key={slot} className={cn(
                                          "p-4 text-center font-black text-[9px] uppercase tracking-tighter border-r border-slate-100 min-w-[70px]",
                                          isHour ? "text-blue-600 bg-blue-50/30" : "text-slate-300"
                                       )}>
                                          {isHour ? `${slot}:00` : Math.round((slot % 1) * 60)}
                                       </th>
                                    )
                                 })}
                              </tr>
                           </thead>
                           <tbody>
                              {DAYS.map((day, dayIndex) => (
                                 <tr key={dayIndex} className="border-b border-slate-50 group/row">
                                    <td className="p-6 border-r border-slate-100 bg-slate-50/30 group-hover/row:bg-blue-50/30 transition-colors sticky left-0 z-20 backdrop-blur-sm min-w-[140px]">
                                       <div className="font-black text-slate-900 text-xs uppercase tracking-tight">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                                       <div className="text-[10px] text-blue-500 font-black mt-0.5">{day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                                    </td>
                                    {(() => {
                                       const cells = []
                                       let i = 0
                                       while (i < SLOTS.length) {
                                          const slot = SLOTS[i]
                                          const res = getReservationAt(day, slot)
                                          const isPast = new Date(day).setHours(Math.floor(slot), Math.round((slot % 1) * 60)) < new Date().getTime()
                                          const isSelectable = !res && order.status === 'ACTIVE' && !isPast
                                          const isSameDayDrag = dragStart && dragStart.day.toDateString() === day.toDateString()
                                          const isSameDayPending = pendingSlot && new Date(pendingSlot.day).toDateString() === day.toDateString()
                                          const isInDrag = (isSameDayDrag && dragStart && dragEnd && slot >= dragStart.hour && slot <= dragEnd.hour) ||
                                                           (isSameDayPending && pendingSlot && slot >= pendingSlot.startHour && slot < pendingSlot.endHour)

                                          if (res) {
                                             const rStart = new Date(res.startTime)
                                             const rEnd = new Date(res.endTime)
                                             
                                             const startHour = rStart.getHours() + rStart.getMinutes() / 60
                                             const endHour = rEnd.getHours() + rEnd.getMinutes() / 60
                                             
                                             let span = 0
                                             while (i + span < SLOTS.length && SLOTS[i + span] < endHour) span++
                                             if (span === 0) span = 1

                                             const isOwn = res.orderId === orderId
                                             const bgColor = getReservationStatusColor(res.status)

                                             cells.push(
                                                <td
                                                   key={slot}
                                                   colSpan={span}
                                                   className="h-16 p-1 border-r border-slate-50 relative group/cell"
                                                   onClick={() => isOwn && setSelectedRes(res)}
                                                >
                                                   <div className={cn(
                                                      bgColor,
                                                      "h-full rounded-2xl flex flex-col items-center justify-center transition-all shadow-md group-hover/cell:scale-[1.01] group-hover/cell:shadow-xl",
                                                      isOwn ? 'cursor-pointer' : 'cursor-help opacity-70 grayscale-[0.3]'
                                                   )}>
                                                      <span className="text-white font-black text-[9px] uppercase tracking-[0.15em] drop-shadow-sm">
                                                         {isOwn ? 'Ma Session' : 'Occupé'}
                                                      </span>
                                                      <span className="text-white/90 text-[8px] font-bold mt-0.5 tracking-tighter">
                                                         {format(rStart, 'HH:mm')} – {format(new Date(rEnd.getTime() - (isOwn ? 15*60*1000 : 0)), 'HH:mm')}
                                                      </span>
                                                   </div>
                                                </td>
                                             )
                                             i += span
                                          } else {
                                             cells.push(
                                                <td
                                                   key={slot}
                                                   className="h-16 p-1 border-r border-slate-50 min-w-[70px] group/cell select-none"
                                                   onMouseDown={() => {
                                                      if (!isSelectable) return
                                                      
                                                      const duration = nextSession.duration
                                                      const calculatedEndHour = slot + duration
                                                      
                                                      let finalEndHour = calculatedEndHour
                                                      for(let h = slot; h < calculatedEndHour; h += 0.25) {
                                                         if (getReservationAt(day, h)) {
                                                            finalEndHour = h
                                                            break
                                                         }
                                                      }
                                                      
                                                      if (finalEndHour > slot) {
                                                         setPendingSlot({ day, startHour: slot, endHour: finalEndHour })
                                                         setDragStart({ day, hour: slot })
                                                         setDragEnd({ day, hour: finalEndHour - 0.25 })
                                                      } else {
                                                         toast.error('Pas assez d\'espace pour cette séance')
                                                         setDragStart(null)
                                                         setDragEnd(null)
                                                      }
                                                      setIsDragging(true)
                                                   }}
                                                   onMouseEnter={() => {
                                                      if (isDragging && dragStart && dragStart.day.toDateString() === day.toDateString() && slot >= dragStart.hour) {
                                                         setDragEnd({ day, hour: slot })
                                                      }
                                                   }}
                                                   onMouseUp={() => {
                                                      if (isDragging && dragStart && dragEnd) {
                                                         setPendingSlot({ day: dragStart.day, startHour: dragStart.hour, endHour: dragEnd.hour + 0.25 })
                                                      }
                                                      setIsDragging(false)
                                                      setDragStart(null)
                                                      setDragEnd(null)
                                                   }}
                                                >
                                                   <div className={cn(
                                                      "w-full h-full rounded-2xl flex items-center justify-center transition-all duration-300",
                                                      isPast ? 'cursor-not-allowed opacity-20' :
                                                      isInDrag ? 'bg-blue-600 shadow-xl shadow-blue-100 cursor-pointer scale-[1.02]' :
                                                      isSelectable ? 'hover:bg-blue-50 hover:shadow-inner cursor-pointer' : 'cursor-not-allowed grayscale-[0.8] opacity-10'
                                                   )}>
                                                      <span className={cn(
                                                         "text-[10px] font-black transition-colors",
                                                         isPast ? 'text-slate-200' :
                                                         isInDrag ? 'text-white' :
                                                         'text-slate-50 group-hover/cell:text-blue-400'
                                                      )}>
                                                         {isInDrag ? (slot === dragStart?.hour ? '\u25B6' : '\u2014') : '\u25CB'}
                                                      </span>
                                                   </div>
                                                </td>
                                             )
                                             i++
                                          }
                                       }
                                       return cells
                                    })()}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap gap-8 px-8 py-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-lg bg-yellow-400 shadow-sm shadow-yellow-100"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">En attente</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-lg bg-emerald-500 shadow-sm shadow-emerald-100"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Confirmé</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-sm shadow-blue-100"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Terminé</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-lg bg-red-400 shadow-sm shadow-red-100"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Annulé</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-lg bg-purple-400 shadow-sm shadow-purple-100"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Absence</span>
                         </div>
                      </div>
                   </div>
                </div>
             </TabsContent>

             <TabsContent value="messages" className="m-0 flex-1 flex flex-col focus-visible:ring-0">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 scroll-smooth">
                   {messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
                           <MessageSquare className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight font-sans">Aucune transmission encore</h3>
                        <p className="text-sm font-bold text-slate-500 max-w-xs font-sans">Commencez une conversation avec votre consultant concernant vos objectifs.</p>
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
                          placeholder="Rédigez votre message..."
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

             <TabsContent value="missions" className="m-0 flex-1 p-4 md:p-12 focus-visible:ring-0 overflow-y-auto">
                <div className="flex flex-col h-full gap-8">
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Missions Opérationnelles</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest font-sans">Suivi de la complétion des jalons et des objectifs du projet</p>
                   </div>

                   {!order.missions || order.missions.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
                           <Target className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight font-sans">Aucune mission active</h3>
                        <p className="text-sm font-bold text-slate-500 max-w-xs font-sans">Les objectifs spécifiques seront répertoriés ici au fur et à mesure.</p>
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
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{completed}/{total} Jalons Atteints</span>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Progression de la Mission</p>
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
                                                onClick={() => updateMilestoneStatus(m.id, m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                                                className={cn(
                                                  "border-none shadow-sm rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-2 flex-shrink-0",
                                                  m.status === 'COMPLETED' ? "bg-emerald-50/30 border-emerald-100" : m.status === 'IN_PROGRESS' ? "bg-blue-50/30 border-blue-100" : "bg-white border-slate-50 shadow-slate-100/50 hover:shadow-md"
                                                )}
                                              >
                                                 <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                      "h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border-2 mt-0.5 transition-colors",
                                                      m.status === 'COMPLETED' ? "bg-emerald-500 border-emerald-500" : m.status === 'IN_PROGRESS' ? "border-blue-500" : "bg-white border-slate-200"
                                                    )}>
                                                       {m.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-white" /> : m.status === 'IN_PROGRESS' ? <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> : <div className="w-4 h-4 rounded-full border border-slate-200" />}
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
                                                             <Clock className="w-2.5 h-2.5" /> Échéance {new Date(m.dueDate).toLocaleDateString()}
                                                          </p>
                                                       )}
                                                    </div>
                                                 </div>
                                              </div>
                                           ))}
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

             <TabsContent value="reviews" className="m-0 flex-1 p-4 md:p-10 focus-visible:ring-0 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-10">
                   <div className="flex flex-col gap-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans uppercase">Votre Feedback</h3>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest font-sans">Consultez et modifiez les avis laissés pour cette commande</p>
                   </div>

                   {order.reviews && order.reviews.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {order.reviews.map((review: any) => (
                            <Card key={review.id} className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden p-8 group relative hover:shadow-2xl transition-all duration-300">
                               <div className="flex justify-between items-start mb-6">
                                  <div className="flex flex-col gap-1">
                                     <Badge className={cn(
                                        "w-fit border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full font-sans",
                                        review.type === 'SERVICE' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                                     )}>
                                        {review.type === 'SERVICE' ? 'Qualité Service' : 'Expertise Consultant'}
                                     </Badge>
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight mt-1 font-sans">
                                        Posté le {new Date(review.createdAt).toLocaleDateString()}
                                     </span>
                                  </div>
                                  <ReviewDialog
                                    type={review.type}
                                    targetId={order.id}
                                    title={review.type === 'SERVICE' ? order.serviceTier.service.name : (order.consultant?.name || "Consultant")}
                                    initialRating={review.rating}
                                    initialComment={review.comment}
                                    reviewId={review.id}
                                    onSuccess={fetchOrder}
                                    trigger={
                                      <button className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all group/edit">
                                         <Pencil className="w-4 h-4" />
                                      </button>
                                    }
                                  />
                               </div>

                               <div className="flex items-center gap-1 mb-6">
                                  {[...Array(5)].map((_, i) => (
                                     <Star key={i} className={cn("w-5 h-5", i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-100")} />
                                  ))}
                               </div>

                               {review.comment ? (
                                  <div className="relative">
                                     <div className="absolute -left-2 -top-2 text-slate-50 text-4xl font-serif">“</div>
                                     <p className="text-slate-600 font-medium italic relative z-10 pl-2 leading-relaxed">
                                        {review.comment}
                                     </p>
                                  </div>
                               ) : (
                                  <p className="text-slate-300 italic font-medium">Aucun commentaire écrit.</p>
                               )}

                               {/* Decorative background shape */}
                               <div className={cn(
                                  "absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
                                  review.type === 'SERVICE' ? "bg-blue-600" : "bg-emerald-600"
                               )} />
                            </Card>
                         ))}
                      </div>
                   ) : (
                      <Card className="border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center bg-white/40">
                         <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-6">
                            <Star className="w-8 h-8 text-slate-200" />
                         </div>
                         <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight font-sans">Aucun avis encore</h4>
                         <p className="text-slate-400 font-medium max-w-xs mx-auto font-sans">Une fois la commande terminée, vous pourrez évaluer notre service et votre expert.</p>
                      </Card>
                   )}
                </div>
             </TabsContent>

          </div>
        </Tabs>

      </div>
      
      {/* Meeting Type Selection Modal from Old Version */}
      {pendingSlot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100]" onClick={() => setPendingSlot(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] max-w-md w-full mx-4 p-8 border border-white/20" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-8">
               <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-6">
                  <CalendarIcon className="w-10 h-10 text-blue-600" />
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Type de réunion</h2>
               <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                  {pendingSlot.day.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  <br/>
                  <span className="text-blue-600">{pendingSlot.startHour}h \u2013 {pendingSlot.endHour}h</span>
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { bookReservation(pendingSlot.day, pendingSlot.startHour, pendingSlot.endHour, 'ZOOM'); setPendingSlot(null) }}
                className="flex flex-col items-center gap-4 p-6 border-2 border-blue-100 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50 transition-all group group/btn"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover/btn:bg-blue-600 transition-colors">
                   <Play className="w-6 h-6 text-blue-600 fill-current group-hover/btn:text-white" />
                </div>
                <div className="text-center">
                  <span className="font-black text-slate-900 uppercase text-xs block tracking-widest">Zoom</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Réunion en ligne</span>
                </div>
              </button>
              <button
                onClick={() => { bookReservation(pendingSlot.day, pendingSlot.startHour, pendingSlot.endHour, 'SUR_PLACE'); setPendingSlot(null) }}
                className="flex flex-col items-center gap-4 p-6 border-2 border-emerald-100 rounded-[2rem] hover:border-emerald-500 hover:bg-emerald-50 transition-all group/btn"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover/btn:bg-emerald-600 transition-colors">
                   <Target className="w-6 h-6 text-emerald-600 group-hover/btn:text-white" />
                </div>
                <div className="text-center">
                  <span className="font-black text-slate-900 uppercase text-xs block tracking-widest">Sur Place</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Réunion physique</span>
                </div>
              </button>
            </div>
            
            <button 
               onClick={() => setPendingSlot(null)} 
               className="mt-8 w-full text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.3em] transition-colors"
            >
               Annuler la sélection
            </button>
          </motion.div>
        </div>
      )}

      {/* Reservation Detail Modal from Old Version */}
      {selectedRes && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100]" onClick={() => setSelectedRes(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.3)] max-w-md w-full mx-4 overflow-hidden border border-white/20" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={cn(
               "p-8 text-white relative",
               getReservationStatusColor(selectedRes.status)
            )}>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Détails de Session</h2>
                  <p className="text-white/80 text-xs font-black uppercase tracking-widest mt-1">{order.serviceTier.service.name}</p>
                </div>
                <button onClick={() => setSelectedRes(null)} className="text-white/70 hover:text-white text-3xl font-black leading-none transition-transform hover:rotate-90 active:scale-90">&times;</button>
              </div>
              <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8">
              {/* Status & Time */}
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm", getBadgeStatusColor(selectedRes.status))}>
                  {selectedRes.status}
                </Badge>
                <Badge className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm",
                  selectedRes.meetingType === 'SUR_PLACE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                )}>
                  {selectedRes.meetingType === 'SUR_PLACE' ? '🏢 Sur Place' : '🎥 Zoom'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                 <div className="h-14 w-14 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-sm leading-none">
                    <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{new Date(selectedRes.startTime).toLocaleString('fr-FR', { month: 'short' })}</span>
                    <span className="text-xl font-black text-slate-900">{new Date(selectedRes.startTime).getDate()}</span>
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Horaire prévu</p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                       {new Date(selectedRes.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} \u2013 {new Date(selectedRes.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                 </div>
              </div>

              {/* Zoom Details for CONFIRMED */}
              {selectedRes.status === 'CONFIRMED' && selectedRes.meetingType !== 'SUR_PLACE' && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                       <Play className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-sm font-black text-blue-700 uppercase tracking-widest">Conférence Zoom</span>
                  </div>

                  {/* Join URL */}
                  {selectedRes.zoomJoinUrl ? (
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest block opacity-70">Lien de réunion</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-[11px] font-bold text-slate-600 bg-white p-4 rounded-xl border border-blue-200 break-all font-mono truncate shadow-inner">
                          {selectedRes.zoomJoinUrl}
                        </div>
                        <button
                          onClick={() => copyToClipboard(selectedRes.zoomJoinUrl, 'Lien')}
                          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-xs font-black transition-all hover:shadow-lg active:scale-95"
                          title="Copier le lien"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic font-medium text-center py-2 flex items-center justify-center gap-2">
                       <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" />
                       Lien en cours de génération...
                    </div>
                  )}

                  {/* Password */}
                  {selectedRes.zoomPassword && (
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest block opacity-70">Code secret</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-slate-800 bg-white p-4 rounded-xl border border-blue-100 font-black tracking-[0.2em] shadow-inner text-center">
                          {selectedRes.zoomPassword}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedRes.zoomPassword, 'Code')}
                          className="flex-shrink-0 bg-slate-900 hover:bg-black text-white p-4 rounded-xl text-xs font-black transition-all hover:shadow-lg active:scale-95"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Join Button */}
                  {selectedRes.zoomJoinUrl && canJoin(selectedRes) && (
                    <JoinZoomButton joinUrl={selectedRes.zoomJoinUrl} className="w-full justify-center h-16 rounded-2xl shadow-xl shadow-blue-200" />
                  )}
                </div>
              )}

              {/* Sur Place message for CONFIRMED */}
              {selectedRes.status === 'CONFIRMED' && selectedRes.meetingType === 'SUR_PLACE' && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8 text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                     <Target className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                     <p className="text-emerald-700 font-black uppercase text-sm tracking-tight">Réunion en présentiel confirmée</p>
                     <p className="text-emerald-600 shadow-sm text-[11px] font-bold mt-2 leading-relaxed px-4">Consultez votre messagerie pour les détails du lieu de rencontre.</p>
                  </div>
                </div>
              )}

              {/* Pending message */}
              {selectedRes.status === 'PENDING' && (
                <div className="bg-yellow-50/50 border border-yellow-100 rounded-[2rem] p-8 text-center space-y-4">
                   <div className="w-16 h-16 bg-yellow-100 rounded-[1.5rem] flex items-center justify-center mx-auto animate-pulse">
                      <Clock className="w-8 h-8 text-yellow-600" />
                   </div>
                   <div>
                     <p className="text-yellow-700 text-sm font-black uppercase tracking-tight">En attente de confirmation</p>
                     <p className="text-yellow-600 text-[11px] font-bold mt-1">Les détails apparaîtront une fois le créneau validé par l'expert.</p>
                   </div>
                </div>
              )}

              {/* Cancel button for pending */}
              {selectedRes.status === 'PENDING' && (
                <button
                  onClick={() => { cancelReservation(selectedRes.id); setSelectedRes(null) }}
                  className="w-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white py-5 rounded-[2rem] transition-all text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-red-50 active:scale-95"
                >
                  ✗ Annuler cette Réservation
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Background Ambience */}
      <div className="fixed top-[-200px] right-[-100px] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-100px] left-[300px] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
    </div>
  )
}
