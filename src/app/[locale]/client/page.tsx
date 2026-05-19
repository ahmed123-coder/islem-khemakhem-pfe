'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Package, 
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Zap,
  Layout,
  Star,
  Pencil
} from 'lucide-react'
import { JoinZoomButton } from '@/components/JoinZoomButton'
import { ReviewDialog } from '@/components/reviews/review-dialog'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function ClientDashboard() {
  const t = useTranslations('client.dashboard')
  const commonT = useTranslations('common')
  const [orders, setOrders] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/client/orders')
      const result = await res.json()
      const data = result.data || result
      const allOrders = data.orders || []
      setOrders(allOrders)
      setReservations(data.reservations || [])
      
      // Select the first active order to be featured
      const active = allOrders.find((o: any) => o.status === 'ACTIVE') || allOrders[0]
      setActiveOrder(active)
      
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700'
      case 'CANCELLED': return 'bg-rose-100 text-rose-700'
      case 'NO_SHOW': return 'bg-amber-100 text-amber-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const canJoin = (reservation: any) => {
    const now = new Date()
    const start = new Date(reservation.startTime)
    const end = new Date(reservation.endTime)
    const earlyAccessMs = 15 * 60 * 1000 
    return now.getTime() >= (start.getTime() - earlyAccessMs) && now.getTime() <= end.getTime()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-black text-slate-400 font-sans uppercase tracking-widest">{t('securingConnection')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 lg:p-12 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
{/* Active Subscription Featured Card */}
        <section>
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
               <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
               {t('currentService')}
             </h3>
             <Link href="/client/solutions">
               <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest gap-2">
                 {t('exploreTiers')} <ArrowRight className="w-3 h-3" />
               </Button>
             </Link>
           </div>

          {activeOrder ? (
            <Card className="border-none shadow-2xl shadow-blue-100/40 rounded-[2.5rem] overflow-hidden bg-white group transition-all duration-500 hover:shadow-blue-200/50 relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110" />
              <CardContent className="p-0 flex flex-col lg:flex-row relative z-10">
                {/* Left: Info */}
                <div className="lg:w-3/5 p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                        <Package className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{activeOrder.serviceTier.service.name}</h2>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest relative">
                            <span className="absolute -left-1 -top-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            {t('active')}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-blue-500 uppercase tracking-widest">{activeOrder.serviceTier.tierType} {t('excellenceTier')}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mt-12">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('messages')}</span>
                          <span className="text-sm font-black text-slate-900">{activeOrder.messagesUsed} <span className="text-slate-400 font-bold">/ {activeOrder.serviceTier.maxMessages || '∞'}</span></span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full shadow-lg shadow-blue-200 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(100, (activeOrder.messagesUsed / (activeOrder.serviceTier.maxMessages || 100)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('consultingMinutes')}</span>
                          <span className="text-sm font-black text-slate-900">{activeOrder.callMinutesUsed} <span className="text-slate-400 font-bold">/ {activeOrder.serviceTier.maxCallDuration || '∞'}</span></span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full shadow-lg shadow-blue-200 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(100, (activeOrder.callMinutesUsed / (activeOrder.serviceTier.maxCallDuration || 100)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reviews for Active Order */}
                    {activeOrder.reviews && activeOrder.reviews.length > 0 && (
                      <div className="mt-8 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('recentFeedback')}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activeOrder.reviews.map((review: any) => (
                            <div key={review.id} className="bg-slate-50/30 backdrop-blur-sm rounded-2xl p-4 border border-slate-100/50 shadow-sm transition-all hover:bg-white hover:shadow-md">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className={cn(
                                  "text-[8px] font-black uppercase px-2 py-0.5 border-none",
                                  review.type === 'SERVICE' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                  {review.type}
                                </Badge>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={cn("w-2.5 h-2.5", i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                                    ))}
                                  </div>
                                  <ReviewDialog
                                    type={review.type}
                                    targetId={activeOrder.id}
                                    title={review.type === 'SERVICE' ? activeOrder.serviceTier.service.name : (activeOrder.consultant?.name || "Consultant")}
                                    initialRating={review.rating}
                                    initialComment={review.comment}
                                    reviewId={review.id}
                                    onSuccess={fetchData}
                                    trigger={
                                      <button className="p-1 hover:bg-blue-50 rounded-md transition-colors group/edit">
                                        <Pencil className="w-2.5 h-2.5 text-slate-300 group-hover:text-blue-500" />
                                      </button>
                                    }
                                  />
                                </div>
                              </div>
                              {review.comment && <p className="text-[10px] font-bold text-slate-600 italic leading-relaxed line-clamp-2">"{review.comment}"</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-8 mt-12 pt-8 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{t('yourConsultant')}</p>
                      <p className="text-sm font-black text-slate-900">{activeOrder.consultant?.name || t('assignedPending')}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{t('billingPeriod')}</p>
                      <p className="text-sm font-black text-slate-900">{t('renewableMonthly')}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="lg:w-2/5 p-8 md:p-12 bg-slate-50/50 flex flex-col justify-center gap-4">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">{t('quickAccess')}</h4>
                   <Link href={`/client/orders/${activeOrder.id}`} className="w-full">
                     <Button className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 group">
                        {t('manageSubscriptions')} <ExternalLink className="w-4 h-4 ml-2 opacity-30 group-hover:opacity-100 transition-opacity" />
                     </Button>
                   </Link>
                   <Link href="/client/solutions" className="w-full">
                     <Button variant="outline" className="w-full h-14 bg-white border-slate-200 hover:bg-slate-50 text-slate-900 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-sm transition-all active:scale-95">
                        {t('upgradeExperience')}
                     </Button>
                   </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center bg-white/50">
               <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Search className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-2">{t('noActiveMembership')}</h3>
               <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8 leading-relaxed">{t('noActiveDesc')}</p>
               <Link href="/client/solutions">
                 <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 h-14 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
                    {t('discoverServices')}
                 </Button>
               </Link>
            </Card>
          )}
        </section>

        {/* Missions Tracking (Visual Timeline/Cards) */}
        {activeOrder && activeOrder.missions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                 {t('missionsTracking')}
               </h3>
               <Badge className="bg-slate-100 text-slate-500 border-none font-bold uppercase text-[9px] px-3">
                 {activeOrder.missions.length} {t('registered')}
               </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrder.missions.map((mission: any) => {
                const total = mission.milestones.length
                const completed = mission.milestones.filter((m: any) => m.status === 'COMPLETED').length
                const progress = total > 0 ? (completed / total) * 100 : 0
                
                return (
                  <Card key={mission.id} className="border border-slate-200 hover:border-blue-200 transition-all duration-300 rounded-[2rem] shadow-xl shadow-slate-200/20 bg-white overflow-hidden group">
                    <CardHeader className="p-6 pb-0">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={cn(
                          "uppercase text-[9px] font-black tracking-widest px-2.5 py-1 rounded-lg border-none",
                          mission.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {mission.status}
                        </Badge>
                        <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">REF: {mission.id.slice(-6)}</div>
                      </div>
                      <CardTitle className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{mission.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-6">
                      <p className="text-xs font-semibold text-slate-500 mb-6 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                         {t('milestonesAchieved', { completed, total })}
                      </p>
                      
                      <div className="space-y-3">
                         <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            <span>{t('status')}</span>
                            <span>{Math.round(progress)}%</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progress}%` }}
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             className={cn(
                               "h-full rounded-full shadow-sm",
                               progress === 100 ? "bg-emerald-500 shadow-emerald-100" : "bg-blue-600 shadow-blue-100"
                             )}
                           />
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Tabs System: Reservations & Activity */}
        <section>
           <Tabs defaultValue="reservations" className="space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                   {t('timeline')}
                 </h3>
                 <TabsList className="bg-slate-100 h-10 p-1 rounded-2xl gap-1 border border-slate-100">
                    <TabsTrigger value="reservations" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">
                      {t('reservations')} ({reservations.length})
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">
                      {t('history')} ({orders.length})
                    </TabsTrigger>
                 </TabsList>
              </div>

              <TabsContent value="reservations" className="m-0 focus-visible:ring-0">
                <AnimatePresence mode="wait">
                  {reservations.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center shadow-2xl shadow-slate-200/20"
                    >
                       <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-500 font-bold text-sm">{t('noReservations')}</p>
                       <Link href="/client/solutions" className="text-blue-600 hover:underline text-xs font-black uppercase tracking-widest mt-4 inline-block">{t('bookNow')}</Link>
                    </motion.div>
                  ) : (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden">
                       <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-100">
                             <thead className="bg-slate-50/50">
                                <tr>
                                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('serviceItem')}</th>
                                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('expert')}</th>
                                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('schedule')}</th>
                                   <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('engagement')}</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                {reservations.map(reservation => (
                                  <motion.tr 
                                    key={reservation.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-50/50 transition-colors"
                                  >
                                    <td className="px-8 py-6">
                                       <div className="font-black text-slate-900">{reservation.serviceTier.service.name}</div>
                                       <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">{reservation.serviceTier.tierType} Access</div>
                                    </td>
                                    <td className="px-8 py-6">
                                       <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-black uppercase">
                                             {reservation.consultant.name.substring(0, 2)}
                                          </div>
                                          <div>
                                             <div className="text-xs font-black text-slate-800">{reservation.consultant.name}</div>
                                             <div className="text-[10px] font-bold text-slate-400 truncate w-32">{reservation.consultant.specialty}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-8 py-6">
                                       <div className="text-xs font-black text-slate-900">{new Date(reservation.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                       <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                          {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                       </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                       {reservation.status === 'CONFIRMED' && reservation.zoomJoinUrl ? (
                                          canJoin(reservation) ? (
                                            <JoinZoomButton joinUrl={reservation.zoomJoinUrl} />
                                          ) : (
                                            <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200 text-slate-400 rounded-full px-4 py-1.5">
                                               {t('lockedUntilStart')}
                                            </Badge>
                                          )
                                       ) : (
                                          <Badge className={cn("text-[9px] font-black uppercase border-none px-4 py-1.5 rounded-full shadow-sm", getReservationStatusColor(reservation.status))}>
                                             {reservation.status}
                                          </Badge>
                                       )}
                                    </td>
                                  </motion.tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="orders" className="m-0 focus-visible:ring-0">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map(order => (
                       <Card key={order.id} className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white overflow-hidden p-6 hover:-translate-y-1 transition-all duration-300">
                          <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                   <Zap className="h-6 w-6" />
                                </div>
                                <div>
                                   <h4 className="font-black text-slate-900">{order.serviceTier.service.name}</h4>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <Badge className={cn(
                                "border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full",
                                order.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-600" : 
                                order.status === 'COMPLETED' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                             )}>
                                {order.status}
                             </Badge>
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{order.serviceTier.tierType} Stream</span>
                               
                               {order.status === 'COMPLETED' && (
                                 <div className="flex gap-3 ml-4">
                                   {!order.reviews.some((r: any) => r.type === 'SERVICE') && (
                                     <ReviewDialog 
                                       type="SERVICE"
                                       targetId={order.id}
                                       title={order.serviceTier.service.name}
                                       onSuccess={fetchData}
                                       trigger={
                                         <button className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-widest">
                                           {t('reviewService')}
                                         </button>
                                       }
                                     />
                                   )}
                                   {!order.reviews.some((r: any) => r.type === 'CONSULTANT') && (
                                     <ReviewDialog 
                                       type="CONSULTANT"
                                       targetId={order.id}
                                       title={order.consultant?.name || "Consultant"}
                                       onSuccess={fetchData}
                                       trigger={
                                         <button className="text-[9px] font-black text-emerald-600 hover:underline uppercase tracking-widest">
                                           {t('reviewExpert')}
                                         </button>
                                       }
                                     />
                                   )}
                                 </div>
                               )}
                             </div>
                             <Link href={`/client/orders/${order.id}`}>
                               <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-blue-600 hover:underline p-0">{t('detailedView')}</Button>
                             </Link>
                          </div>

                          {/* Reviews Section */}
                          {order.reviews && order.reviews.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('clientFeedback')}</span>
                                <div className="h-px flex-1 bg-slate-50 mx-4" />
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {order.reviews.map((review: any) => (
                                  <div key={review.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          review.type === 'SERVICE' ? "bg-blue-400" : "bg-emerald-400"
                                        )} />
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tight">
                                          {review.type === 'SERVICE' ? t('serviceQuality') : t('expertExpertise')}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5">
                                          {[...Array(5)].map((_, i) => (
                                            <Star 
                                              key={i} 
                                              className={cn(
                                                "w-3 h-3", 
                                                i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                              )} 
                                            />
                                          ))}
                                        </div>
                                        <ReviewDialog
                                          type={review.type}
                                          targetId={order.id}
                                          title={review.type === 'SERVICE' ? order.serviceTier.service.name : (order.consultant?.name || "Consultant")}
                                          initialRating={review.rating}
                                          initialComment={review.comment}
                                          reviewId={review.id}
                                          onSuccess={fetchData}
                                          trigger={
                                            <button className="p-1 hover:bg-blue-50 rounded-md transition-colors group/edit">
                                              <Pencil className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                                            </button>
                                          }
                                        />
                                      </div>
                                    </div>
                                    {review.comment && (
                                      <p className="text-[11px] font-medium text-slate-600 italic leading-relaxed">
                                        "{review.comment}"
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                       </Card>
                    ))}
                 </div>
              </TabsContent>
           </Tabs>
        </section>

      </div>

      {/* Background Decor */}
      <div className="fixed top-[-200px] right-[-100px] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-100px] left-[300px] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
    </div>
  )
}
