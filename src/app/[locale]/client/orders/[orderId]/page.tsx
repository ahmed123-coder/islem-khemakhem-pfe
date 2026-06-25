'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Target, 
  Send, 
  Clock, 
  CheckCircle2, 
  ChevronLeft,
  ExternalLink,
  Zap,
  ArrowRight,
  Star,
  Pencil,
  Sparkles,
  Play
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { JoinZoomButton } from '@/components/JoinZoomButton'
import { ReviewDialog } from '@/components/reviews/review-dialog'
import { getSocket } from '@/lib/socket-client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import AvailabilityCalendar from '@/components/solutions/AvailabilityCalendar'
import { getNextSessionInfo, NextSessionResult } from '@/lib/sessions-config'

export default function OrderDetails() {
  const t = useTranslations("clientPage.orders")
  const params = useParams()
  const router = useRouter()
<<<<<<< HEAD
  const { locale } = params
  const orderId = params.orderId as string
=======
  const { locale, orderId } = params as { locale: string; orderId: string }
>>>>>>> 1f2e273 (Initial commit)

  const [order, setOrder] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reservations')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  const [selectedRes, setSelectedRes] = useState<any>(null)

  // ── ÉTAT pour la réservation de la prochaine séance ──
  const [nextSessionSelection, setNextSessionSelection] = useState<any>(null) // { date, startTime, endTime, meetingType }
  const [bookingNextSession, setBookingNextSession]     = useState(false)
  const [scheduleStartDate, setScheduleStartDate]       = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

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
        router.push(`/${locale}/client`)
        return
      }
      const result = await res.json()
      const data = result.data || result
      setOrder(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const fetchReservations = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}/reservations`)
      const result = await res.json()
      const data = result.data || result
      setReservations(Array.isArray(data) ? data : [])
    } catch (error) { console.error(error) }
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}/messages`)
      const result = await res.json()
      const data = result.data || result
      setMessages(Array.isArray(data) ? data : [])
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

  const cancelReservation = async (id: string) => {
    if (!confirm(t('confirmCancelSession'))) return
    try {
      const res = await fetch('/api/client/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        toast.success(t('reservationCancelled'))
        fetchReservations()
      } else {
        const data = await res.json()
        toast.error(data.error || t('cancelError'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('genericError'))
    }
  }

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      // Optimistic update
      setOrder((prev: any) => {
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
        toast.error(t('updateStatusError'))
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
    // Keep the Zoom action available well before the meeting starts.
    const earlyAccessMs = 24 * 60 * 60 * 1000
    return now.getTime() >= (start.getTime() - earlyAccessMs) && now.getTime() <= end.getTime()
  }

  const copyToClipboard = (text: string, labelKey: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t(labelKey))
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
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">{t('synchronizing')}</p>
      </div>
    </div>
  )

  if (!order) return <div className="p-20 text-center font-bold">{t('notFound')}</div>

  const myReservations = reservations.filter(r => r.orderId === orderId)

  // ── Calcule si le client peut réserver sa prochaine séance ──
  const nextSession: NextSessionResult = getNextSessionInfo(order, myReservations)

  // ── Construit le tableau "consultants" attendu par AvailabilityCalendar ──
  const consultantForCalendar = order.consultant ? [{
    id: order.consultantId,
    name: order.consultant.name,
    specialty: order.consultant.specialty,
    reservations: reservations.filter(r => r.status !== 'CANCELLED' && r.id !== undefined)
  }] : []

  // ── Confirme la réservation de la prochaine séance ──
  const confirmNextSession = async () => {
    if (!nextSessionSelection) return
    setBookingNextSession(true)
    try {
      const res = await fetch(`/api/client/orders/${orderId}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: nextSessionSelection.startTime,
          endTime: nextSessionSelection.endTime,
          meetingType: nextSessionSelection.meetingType
        })
      })
      if (res.ok) {
        toast.success(t('sessionBooked'))
        setNextSessionSelection(null)
        fetchReservations()
      } else {
        const data = await res.json()
        toast.error(data.error || t('bookingError'))
      }
    } catch (error) {
        toast.error(t('genericError'))
    } finally {
      setBookingNextSession(false)
    }
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 lg:p-12 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Workspace Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col gap-2">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors tracking-widest mb-2 font-sans">
              <ChevronLeft className="w-4 h-4" /> {t('backToOrders')}
            </button>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none font-sans">
              {order.serviceTier?.service?.name || 'Consulting Stream'}
            </h1>
            <p className="text-sm md:text-md font-bold text-slate-400 mt-2 uppercase tracking-widest font-sans">
              {t('workspaceSubtitle')}
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
                   <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 font-sans">{t('expertAssigned')}</p>
                   <p className="text-sm font-black text-slate-900 leading-none font-sans">{order.consultant?.name || t('assignedPending')}</p>
               </div>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 font-sans">{t('status')}</p>
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
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">{review.type === 'SERVICE' ? t('reviewServiceLabel') : t('reviewExpertLabel')}</span>
                           
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
                              {t('reviewService')}
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
                              {t('reviewExpert')}
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
                    {t('tabReservations')}
                 </TabsTrigger>
                 <TabsTrigger value="messages" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans">
                    {t('tabMessages')}
                 </TabsTrigger>
                 <TabsTrigger value="missions" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans">
                    {t('tabMissions')}
                 </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl lg:px-8 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all font-sans flex items-center gap-2">
                                       {t('tabFeedback')} <Badge variant="secondary" className="px-1.5 py-0 bg-blue-50 text-blue-600 border-none text-[8px]">{order.reviews?.length || 0}</Badge>
                </TabsTrigger>
             </TabsList>
             
             <div className="hidden md:flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {t('usage', { used: Math.round(nextSession.usedMinutes), total: nextSession.totalMinutes ?? '∞' })}
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> {t('chat', { used: order.messagesUsed, max: order.serviceTier?.maxMessages || '∞' })}
                </div>
             </div>
          </div>

          <div className="flex-1 min-h-[500px] bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl relative overflow-hidden flex flex-col">
             
             <TabsContent value="reservations" className="m-0 flex-1 p-4 md:p-10 focus-visible:ring-0 overflow-y-auto">
                <div className="space-y-12">
                   
                   {/* Table View of Personal Sessions */}
                   <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-50/50 p-6 border-b border-slate-100">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight font-sans">{t('mySessions')}</h3>
                      </div>
                      {myReservations.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic font-sans font-bold">{t('noSessions')}</div>
                      ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                              <thead className="bg-slate-50/30">
                                 <tr className="border-b border-slate-100">
                                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('session')}</th>
                                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dateTime')}</th>
                                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('type')}</th>
                                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('status')}</th>
                                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('engagement')}</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {myReservations.map(reservation => (
                                    <tr key={reservation.id} className="hover:bg-slate-50/30 transition-colors">
                                       <td className="px-8 py-6">
                                          <div className="font-black text-slate-900 text-sm font-sans">
                                             {reservation.sessionLabel || t('sessionNumber', { n: (reservation.sessionIndex ?? 0) + 1 })}
                                          </div>
                                       </td>
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
                                              {reservation.meetingType === 'SUR_PLACE' ? '🏢 ' + t('inPerson') : '🎥 ' + t('zoom')}
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
                                                      {reservation.status === 'CONFIRMED' ? t('available24hBefore') : (reservation.status === 'COMPLETED' ? t('sessionCompleted') : t('pendingConfirmation'))}
                                                </span>
                                                {reservation.status === 'PENDING' && (
                                                   <button 
                                                      onClick={() => cancelReservation(reservation.id)}
                                                      className="text-[9px] text-red-500 hover:text-red-700 font-black uppercase tracking-widest underline decoration-2 underline-offset-4"
                                                   >
                                                       {t('cancelRequest')}
                                                   </button>
                                                )}
                                             </div>
                                          )}
                                       </td>
                                       <td className="px-4 py-6 text-right">
                                          <button onClick={() => setSelectedRes(reservation)} className="text-slate-300 hover:text-blue-600 transition-colors">
                                             <ExternalLink className="w-4 h-4" />
                                          </button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                      )}
                   </div>

                   {/* ══════════════════════════════════════════
                       SECTION — RÉSERVER LA PROCHAINE SÉANCE
                       S'affiche uniquement quand nextSession.canBook === true
                   ══════════════════════════════════════════ */}
                   {nextSession.canBook && (
                     <div className="space-y-6">
                       <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl" />
                          <div className="relative z-10 flex items-start gap-4">
                             <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6" />
                             </div>
                             <div>
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-1">
                                    {t('nextStepAvailable')}
                                 </p>
                                 <h3 className="text-2xl font-black tracking-tight">
                                    {t('bookYour', { label: nextSession.label.toLowerCase() })}
                                 </h3>
                                 <p className="text-blue-100 text-sm font-bold mt-1">
                                    {t('proposedDuration', { duration: nextSession.duration })}
                                    {nextSession.totalMinutes !== null
                                      ? ` · ${t('remainingTime')}: ${Math.floor((nextSession.remainingMinutes || 0) / 60)}h${Math.round((nextSession.remainingMinutes || 0) % 60) > 0 ? Math.round((nextSession.remainingMinutes || 0) % 60) : ''} ${t('of')} ${Math.floor(nextSession.totalMinutes / 60)}h${nextSession.totalMinutes % 60 > 0 ? nextSession.totalMinutes % 60 : ''}`
                                      : ` · ${t('customPack')}`}
                                </p>
                             </div>
                          </div>
                       </div>

                       {/* Calendrier simplifié — même composant que la page d'achat */}
                       <AvailabilityCalendar
                         consultants={consultantForCalendar}
                         onSelect={setNextSessionSelection}
                         scheduleStartDate={scheduleStartDate}
                         requiredDuration={nextSession.duration}
                         onNavigate={(days) => {
                           const newDate = new Date(scheduleStartDate)
                           newDate.setDate(newDate.getDate() + days)
                           const today = new Date()
                           today.setHours(0, 0, 0, 0)
                           setScheduleStartDate(newDate < today ? today : newDate)
                         }}
                         onJumpToDate={setScheduleStartDate}
                       />

                       {/* Bouton de confirmation — apparaît quand date+heure+type sont choisis */}
                       {nextSessionSelection && (
                         <div className="bg-[#1B3F7A] rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 flex flex-wrap items-center justify-between gap-4">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-1">
                                {t('readyToConfirm', { label: nextSession.label })}
                              </p>
                             <p className="font-black text-lg">
                               {new Date(nextSessionSelection.startTime).toLocaleDateString('fr-FR', {
                                 weekday: 'long', day: 'numeric', month: 'long'
                               })}
                             </p>
                             <p className="text-blue-200 font-bold text-sm">
                               {new Date(nextSessionSelection.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                               {' → '}
                               {new Date(nextSessionSelection.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                               {' · '}
                                {nextSessionSelection.meetingType === 'SUR_PLACE' ? '🏢 ' + t('inPerson') : '🎥 ' + t('zoom')}
                             </p>
                           </div>
                           <Button
                             onClick={confirmNextSession}
                             disabled={bookingNextSession}
                             className="bg-white text-blue-900 hover:bg-amber-400 px-8 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                           >
                              {bookingNextSession ? t('booking') : t('confirmSession')}
                           </Button>
                         </div>
                       )}
                     </div>
                   )}

                   {/* ══════════════════════════════════════════
                       MESSAGES D'ÉTAT — quand la prochaine séance
                       n'est pas encore réservable
                   ══════════════════════════════════════════ */}
                   {!nextSession.canBook && nextSession.reason === 'ACTIVE_RESERVATION_EXISTS' && (
                     <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                           <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="font-black text-amber-900 text-sm uppercase tracking-tight">{t('sessionInProgress')}</p>
                            <p className="text-amber-700 text-sm font-medium mt-0.5">
                               {t('sessionInProgressDesc')}
                            </p>
                        </div>
                     </div>
                   )}

                   {!nextSession.canBook && nextSession.reason === 'ALL_SESSIONS_DONE' && (
                     <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                           <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-black text-emerald-900 text-sm uppercase tracking-tight">{t('allSessionsPlanned')}</p>
                            <p className="text-emerald-700 text-sm font-medium mt-0.5">
                               {t('allSessionsPlannedDesc', { used: Math.round(nextSession.usedMinutes), total: nextSession.totalMinutes ?? 0 })}
                            </p>
                        </div>
                     </div>
                   )}

                   {!nextSession.canBook && nextSession.reason === 'PROJECT_COMPLETED' && (
                     <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                           <CheckCircle2 className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{t('projectCompleted')}</p>
                            <p className="text-slate-500 text-sm font-medium mt-0.5">
                               {t('projectCompletedDesc')}
                            </p>
                        </div>
                     </div>
                   )}

                </div>
             </TabsContent>

             <TabsContent value="messages" className="m-0 flex-1 flex flex-col focus-visible:ring-0">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 scroll-smooth">
                   {!Array.isArray(messages) || messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
                           <MessageSquare className="w-8 h-8 text-slate-400" />
                        </div>
                         <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight font-sans">{t('noMessages')}</h3>
                         <p className="text-sm font-bold text-slate-500 max-w-xs font-sans">{t('startConversation')}</p>
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
                          placeholder={t('writeMessage')}
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
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">{t('operationalMissions')}</h3>
                       <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest font-sans">{t('missionsSubtitle')}</p>
                   </div>

                   {!order.missions || order.missions.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
                           <Target className="w-8 h-8 text-slate-400" />
                        </div>
                         <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight font-sans">{t('noActiveMissions')}</h3>
                         <p className="text-sm font-bold text-slate-500 max-w-xs font-sans">{t('noActiveMissionsDesc')}</p>
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
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('milestonesAchieved', { completed, total })}</span>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{t('missionProgress')}</p>
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
                                                              <Clock className="w-2.5 h-2.5" /> {t('dueDate')} {new Date(m.dueDate).toLocaleDateString()}
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
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans uppercase">{t('yourFeedback')}</h3>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest font-sans">{t('feedbackDescription')}</p>
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
                                         {review.type === 'SERVICE' ? t('serviceQuality') : t('consultantExpertise')}
                                     </Badge>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight mt-1 font-sans">
                                         {t('postedOn', { date: new Date(review.createdAt).toLocaleDateString() })}
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
                                   <p className="text-slate-300 italic font-medium">{t('noComment')}</p>
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
                          <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight font-sans">{t('noReviews')}</h4>
                          <p className="text-slate-400 font-medium max-w-xs mx-auto font-sans">{t('noReviewsDesc')}</p>
                      </Card>
                   )}
                </div>
             </TabsContent>

          </div>
        </Tabs>

      </div>
      
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
                  <h2 className="text-2xl font-black uppercase tracking-tight">{t('sessionDetails')}</h2>
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
                   {selectedRes.meetingType === 'SUR_PLACE' ? '🏢 ' + t('inPerson') : '🎥 ' + t('zoom')}
                </Badge>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                 <div className="h-14 w-14 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-sm leading-none">
                    <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{new Date(selectedRes.startTime).toLocaleString('fr-FR', { month: 'short' })}</span>
                    <span className="text-xl font-black text-slate-900">{new Date(selectedRes.startTime).getDate()}</span>
                 </div>
                 <div className="flex-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('scheduledTime')}</p>
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
                     <span className="text-sm font-black text-blue-700 uppercase tracking-widest">{t('zoomConference')}</span>
                  </div>

                  {/* Join URL */}
                  {selectedRes.zoomJoinUrl ? (
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest block opacity-70">{t('meetingLink')}</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-[11px] font-bold text-slate-600 bg-white p-4 rounded-xl border border-blue-200 break-all font-mono truncate shadow-inner">
                          {selectedRes.zoomJoinUrl}
                        </div>
                        <button
                          onClick={() => copyToClipboard(selectedRes.zoomJoinUrl, 'linkCopied')}
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
                           {t('generatingLink')}
                        </div>
                  )}

                  {/* Password */}
                  {selectedRes.zoomPassword && (
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest block opacity-70">{t('secretCode')}</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-slate-800 bg-white p-4 rounded-xl border border-blue-100 font-black tracking-[0.2em] shadow-inner text-center">
                          {selectedRes.zoomPassword}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedRes.zoomPassword, 'codeCopied')}
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
                      <p className="text-emerald-700 font-black uppercase text-sm tracking-tight">{t('inPersonMeetingConfirmed')}</p>
                      <p className="text-emerald-600 shadow-sm text-[11px] font-bold mt-2 leading-relaxed px-4">{t('checkEmailForDetails')}</p>
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
                      <p className="text-yellow-700 text-sm font-black uppercase tracking-tight">{t('pendingConfirmation')}</p>
                      <p className="text-yellow-600 text-[11px] font-bold mt-1">{t('pendingConfirmationDesc')}</p>
                   </div>
                </div>
              )}

              {/* Cancel button for pending */}
              {selectedRes.status === 'PENDING' && (
                <button
                  onClick={() => { cancelReservation(selectedRes.id); setSelectedRes(null) }}
                  className="w-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white py-5 rounded-[2rem] transition-all text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-red-50 active:scale-95"
                >
                  {'✗ ' + t('cancelReservation')}
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