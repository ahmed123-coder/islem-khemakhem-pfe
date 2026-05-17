'use client'

import * as React from 'react'
import { 
  Calendar, 
  CalendarX, 
  Clock, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Filter,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Video,
  MapPin,
  Trash2,
  Sparkles,
  LayoutGrid,
  List,
  Search
} from 'lucide-react'
import { format, addDays, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { JoinZoomButton } from '@/components/JoinZoomButton'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

const SLOTS = Array.from({ length: 36 }, (_, i) => i * 0.25 + 9) // 9:00 to 18:00 in 15min steps

function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export default function ConsultantReservations() {
  const [reservations, setReservations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [currentWeekStart, setCurrentWeekStart] = React.useState(() => getMonday(new Date()))
  const [selectedRes, setSelectedRes] = React.useState<any>(null)
  
  // View States
  const [viewMode, setViewMode] = React.useState<'calendar' | 'list'>('calendar')
  const [statusFilter, setStatusFilter] = React.useState('all')

  const DAYS = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  }, [currentWeekStart])

  // --- Logic & API Preservation ---

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/consultant/reservations')
      const result = await res.json()
      const data = result.data || result
      setReservations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch error:', error)
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchReservations()
    const handleNotification = (e: any) => {
      if (e.detail?.type === 'RESERVATION') fetchReservations()
    }
    window.addEventListener('notification', handleNotification)
    return () => window.removeEventListener('notification', handleNotification)
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const loadingToast = toast.loading(`Updating...`)
    try {
      const res = await fetch('/api/consultant/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success(`Success`, { id: loadingToast })
      fetchReservations()
      if (selectedRes?.id === id) setSelectedRes((prev: any) => ({ ...prev, status }))
    } catch {
      toast.error('Failed', { id: loadingToast })
    }
  }

  const deleteReservation = async (id: string) => {
    if (!confirm('Permanent delete?')) return
    try {
      await fetch('/api/consultant/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      toast.success('Deleted')
      fetchReservations()
      setSelectedRes(null)
    } catch {
      toast.error('Failed')
    }
  }

  // --- Helpers ---

  const filteredList = React.useMemo(() => {
    if (statusFilter === 'all') return reservations
    return reservations.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase())
  }, [reservations, statusFilter])

  const changeWeek = (dir: number) => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + dir * 7)
    setCurrentWeekStart(d)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold px-3 py-1 rounded-full uppercase text-[9px] tracking-widest">Confirmed</Badge>
      case 'PENDING': return <Badge className="bg-amber-50 text-amber-600 border-none font-bold px-3 py-1 rounded-full uppercase text-[9px] tracking-widest">Pending</Badge>
      case 'CANCELLED': return <Badge className="bg-rose-50 text-rose-600 border-none font-bold px-3 py-1 rounded-full uppercase text-[9px] tracking-widest">Cancelled</Badge>
      case 'COMPLETED': return <Badge className="bg-blue-50 text-blue-600 border-none font-bold px-3 py-1 rounded-full uppercase text-[9px] tracking-widest">Completed</Badge>
      case 'NO_SHOW': return <Badge className="bg-slate-50 text-slate-500 border-none font-bold px-3 py-1 rounded-full uppercase text-[9px] tracking-widest">No Show</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500 shadow-emerald-200 text-white'
      case 'PENDING': return 'bg-amber-400 shadow-amber-100 text-white'
      case 'COMPLETED': return 'bg-blue-500 shadow-blue-100 text-white'
      case 'CANCELLED': return 'bg-rose-500 shadow-rose-100 text-white'
      case 'NO_SHOW': return 'bg-slate-400 shadow-slate-100 text-white'
      default: return 'bg-slate-200 text-slate-500'
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-emerald-600 animate-pulse font-black text-xs">
      <Loader2 className="w-10 h-10 animate-spin" />
      SYNCHRONIZING HUB...
    </div>
  )

  return (
    <div className="p-8 md:p-12 space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
            <Sparkles className="w-4 h-4" />
            Reservation Management
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-4">
            Expert Agenda
            <Badge className="bg-slate-900 text-white border-none font-black text-xs px-4 h-8 rounded-full shadow-lg">
              {reservations.length} Active
            </Badge>
          </h1>
          <p className="text-slate-500 font-bold mt-2 text-sm italic">
            Visualizing your high-impact consultations via {viewMode} view.
          </p>
        </div>

        <div className="flex items-center gap-4 self-end">
           {/* View Switcher */}
           <div className="bg-white border border-slate-200 p-1 rounded-2xl flex items-center shadow-sm">
              <Button 
                variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
                onClick={() => setViewMode('calendar')}
                className={cn("rounded-xl h-10 px-4 font-bold text-xs", viewMode === 'calendar' ? "bg-slate-900 text-white" : "text-slate-400")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" /> Calendar
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                onClick={() => setViewMode('list')}
                className={cn("rounded-xl h-10 px-4 font-bold text-xs", viewMode === 'list' ? "bg-slate-900 text-white" : "text-slate-400")}
              >
                <List className="w-4 h-4 mr-2" /> List
              </Button>
           </div>
           
           {/* Date Range for Calendar / Status for List */}
           {viewMode === 'calendar' ? (
              <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm h-12">
                 <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)} className="rounded-xl h-10 w-10">
                   <ChevronLeft className="w-5 h-5" />
                 </Button>
                 <span className="px-3 font-black text-[10px] uppercase tracking-widest text-slate-900">
                   {format(currentWeekStart, 'dd MMM')} – {format(addDays(currentWeekStart, 6), 'dd MMM')}
                 </span>
                 <Button variant="ghost" size="icon" onClick={() => changeWeek(1)} className="rounded-xl h-10 w-10">
                   <ChevronRight className="w-5 h-5" />
                 </Button>
              </div>
           ) : (
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                 <TabsList className="bg-white border border-slate-200 p-1 h-12 rounded-2xl shadow-sm">
                   <TabsTrigger value="all" className="rounded-xl px-4 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white">All</TabsTrigger>
                   <TabsTrigger value="pending" className="rounded-xl px-4 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white uppercase tracking-tighter">Pending</TabsTrigger>
                   <TabsTrigger value="confirmed" className="rounded-xl px-4 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white uppercase tracking-tighter">Confirmed</TabsTrigger>
                   <TabsTrigger value="completed" className="rounded-xl px-4 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white uppercase tracking-tighter">Finalized</TabsTrigger>
                 </TabsList>
              </Tabs>
           )}
        </div>
      </div>

      {/* Main Container - Glassmorphic Content */}
      <Card className="rounded-[40px] border border-white/20 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden">
        {viewMode === 'calendar' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-6 px-8 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100 w-44">Timeline / Day</th>
                  {SLOTS.map(s => {
                    const isHour = s % 1 === 0
                    return (
                      <th key={s} className={cn(
                        "py-4 text-center text-[9px] font-black border-r border-slate-100 last:border-r-0 min-w-[60px]",
                        isHour ? "text-slate-900 bg-slate-100/50" : "text-slate-300"
                      )}>
                        {isHour ? `${s}:00` : Math.round((s % 1) * 60)}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dayIdx) => (
                  <tr key={dayIdx} className="border-b border-slate-50 last:border-b-0 group">
                    <td className="py-6 px-8 border-r border-slate-100 bg-slate-50/20 group-hover:bg-emerald-50/30 transition-colors">
                       <p className="text-sm font-black text-slate-900 uppercase mb-1 leading-none">{format(day, 'EEEE', { locale: fr })}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-tighter">{format(day, 'dd MMMM', { locale: fr })}</p>
                    </td>
                    {(() => {
                      const cells = []
                      let i = 0
                      while (i < SLOTS.length) {
                        const slot = SLOTS[i]
                        const res = getReservationAt(day, slot)
                        if (res) {
                          const rStart = new Date(res.startTime)
                          const rEnd = new Date(res.endTime)
                          
                          // Calculate how many 15min slots this reservation covers
                          const startHour = rStart.getHours() + rStart.getMinutes() / 60
                          const endHour = rEnd.getHours() + rEnd.getMinutes() / 60
                          
                          let span = 0
                          while (i + span < SLOTS.length && SLOTS[i + span] < endHour) {
                            span++
                          }
                          
                          if (span === 0) span = 1
                          
                          cells.push(
                            <td key={slot} colSpan={span} className="p-1.5 border-r border-slate-100 last:border-r-0 relative">
                              <button
                                onClick={() => setSelectedRes(res)}
                                className={cn(
                                  getStatusColorClass(res.status),
                                  "w-full h-16 rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-[1.01] active:scale-95 shadow-lg group relative overflow-hidden"
                                )}
                              >
                                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl -mr-6 -mt-6" />
                                <span className="font-black text-[9px] uppercase tracking-widest leading-none z-10 truncate max-w-full px-2">{res.client?.name || 'Client'}</span>
                                <span className="text-[8px] font-black opacity-60 z-10 mt-1">
                                  {format(rStart, 'HH:mm')} – {format(rEnd, 'HH:mm')}
                                </span>
                              </button>
                            </td>
                          )
                          i += span
                        } else {
                          cells.push(
                            <td key={slot} className="p-0 border-r border-slate-100 last:border-r-0 h-20 min-w-[60px]">
                              <div className="w-full h-full border-dashed border-slate-50 flex items-center justify-center group-hover:bg-emerald-50/20 transition-colors">
                                 <div className="w-1 h-1 rounded-full bg-slate-100 opacity-20" />
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
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Expert's Client</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Service</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">State</TableHead>
                  <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.length > 0 ? (
                  filteredList.map((res) => (
                    <TableRow key={res.id} className="border-slate-50 group hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="py-6 px-10">
                         <div className="flex items-center gap-4">
                            <Avatar className="w-11 h-11 border-2 border-white shadow-md ring-2 ring-emerald-50">
                               <AvatarFallback className="bg-emerald-600 text-white font-black text-xs">
                                  {res.client?.name?.[0] || 'C'}
                               </AvatarFallback>
                            </Avatar>
                            <div>
                               <p className="text-sm font-black text-slate-900">{res.client?.name || 'Client'}</p>
                               <p className="text-[10px] font-bold text-slate-400 italic">{res.client?.email}</p>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                               <Calendar className="w-4 h-4 text-emerald-600" />
                               {format(new Date(res.startTime), 'EEEE dd MMM', { locale: fr })}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                               <Clock className="w-3.5 h-3.5" />
                               {format(new Date(res.startTime), 'HH:mm')} - {format(new Date(res.endTime), 'HH:mm')}
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900">{res.serviceTier?.service?.name}</span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{res.serviceTier?.tierType} Access</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         {getStatusBadge(res.status)}
                      </TableCell>
                      <TableCell className="text-right pr-10">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-50 text-slate-400">
                                  <MoreHorizontal className="w-5 h-5" />
                               </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-50">
                               <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hub Controls</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => setSelectedRes(res)} className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-emerald-50 focus:text-emerald-500">
                                  <ChevronRight className="w-4 h-4 mr-2" /> View Detailed Card
                               </DropdownMenuItem>
                               <DropdownMenuSeparator className="my-1 bg-slate-50" />
                               <DropdownMenuItem onClick={() => deleteReservation(res.id)} className="rounded-xl px-3 py-2 cursor-pointer text-rose-500 focus:bg-rose-50">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete Permanentely
                               </DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-96 text-center">
                       <div className="flex flex-col items-center justify-center gap-6">
                          <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center border border-white shadow-xl">
                             <CalendarX className="w-10 h-10 text-slate-200" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Agenda is clear</h3>
                            <p className="text-xs text-slate-400 font-bold italic tracking-tight">No reservations found in this category.</p>
                          </div>
                       </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedRes} onOpenChange={() => setSelectedRes(null)}>
         <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[40px] border-none shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Modal Header Cover */}
            <div className={cn("p-12 text-white relative", 
              selectedRes?.status === 'CONFIRMED' ? 'bg-gradient-to-tr from-emerald-600 to-teal-500' :
              selectedRes?.status === 'PENDING' ? 'bg-gradient-to-tr from-amber-500 to-orange-400' :
              selectedRes?.status === 'CANCELLED' ? 'bg-gradient-to-tr from-rose-600 to-pink-500' :
              'bg-slate-900'
            )}>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
               <div className="relative">
                  <div className="flex justify-between items-start mb-10">
                     <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                        {selectedRes?.status}
                     </Badge>
                     <Button variant="ghost" className="text-white/60 hover:text-white rounded-full h-8" onClick={() => setSelectedRes(null)}>Close</Button>
                  </div>
                  <h2 className="text-5xl font-black tracking-tight leading-none mb-6">
                     {selectedRes?.serviceTier?.service?.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-8">
                     <div className="flex items-center gap-3 text-sm font-black italic">
                        <Calendar className="w-5 h-5 opacity-60" />
                        {selectedRes && format(new Date(selectedRes.startTime), 'dd MMMM yyyy', { locale: fr })}
                     </div>
                     <div className="flex items-center gap-3 text-sm font-black italic">
                        <Clock className="w-5 h-5 opacity-60" />
                        {selectedRes && format(new Date(selectedRes.startTime), 'HH:mm')} - {selectedRes && format(new Date(selectedRes.endTime), 'HH:mm')}
                     </div>
                  </div>
               </div>
            </div>

            {/* Modal Content */}
            <div className="p-10 space-y-10 bg-white">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Consulting Partner</p>
                     <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-[32px] border border-slate-100/60">
                        <Avatar className="w-14 h-14 border-4 border-white shadow-xl ring-2 ring-emerald-50">
                           <AvatarFallback className="bg-emerald-600 text-white font-black text-lg">
                              {selectedRes?.client?.name?.[0] || 'C'}
                           </AvatarFallback>
                        </Avatar>
                        <div>
                           <p className="text-base font-black text-slate-900 leading-tight mb-1">{selectedRes?.client?.name || 'Expert'}</p>
                           <p className="text-xs text-slate-400 font-bold italic truncate max-w-[120px]">{selectedRes?.client?.email}</p>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Session Logistics</p>
                     <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-[32px] border border-slate-100/60">
                        <div className="w-14 h-14 rounded-[24px] bg-white border border-slate-100/60 flex items-center justify-center text-emerald-600 shadow-sm ring-2 ring-emerald-50">
                           {selectedRes?.meetingType === 'SUR_PLACE' ? <MapPin className="w-7 h-7" /> : <Video className="w-7 h-7" />}
                        </div>
                        <div>
                           <p className="text-base font-black text-slate-900 leading-tight mb-1">
                              {selectedRes?.meetingType === 'SUR_PLACE' ? 'Face-to-Face' : 'Virtual Session'}
                           </p>
                           <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]">
                              {selectedRes?.serviceTier?.tierType} Mode
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Connection Portal */}
               {selectedRes?.status === 'CONFIRMED' && selectedRes?.meetingType === 'ZOOM_MEETING' && (
                  <div className="p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden group border border-slate-800 shadow-2xl">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                     <div className="relative flex flex-col items-center md:items-start text-center md:text-left gap-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/10">
                              <Video className="w-6 h-6 animate-pulse" />
                           </div>
                           <div>
                              <h4 className="text-xl font-black italic leading-none mb-1">Secured Video Bridge</h4>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Encrypted Zoom Channel Ready</p>
                           </div>
                        </div>
                        {selectedRes.zoomJoinUrl ? (
                          <div className="w-full flex flex-col md:flex-row items-center gap-4">
                             <JoinZoomButton joinUrl={selectedRes.zoomJoinUrl} className="w-full md:w-auto rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black italic h-14 px-10 shadow-[0_10px_40px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1" />
                             <Button variant="ghost" className="text-xs font-black text-slate-500 hover:text-white transition-colors" onClick={() => { navigator.clipboard.writeText(selectedRes.zoomJoinUrl); toast.success('Link Copied') }}>
                                Copy Session ID
                             </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 border-slate-700 py-2 px-6 rounded-full font-black text-[10px] uppercase">Awaiting Activation...</Badge>
                        )}
                     </div>
                  </div>
               )}

               {/* Interaction Action Bar */}
               <div className="flex gap-4 justify-end pt-8 border-t border-slate-100/60">
                  <div className="flex items-center gap-2 mr-auto">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-50 text-slate-300">
                             <Trash2 className="w-5 h-5" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="start" className="p-2 rounded-2xl border-slate-100 shadow-xl">
                          <DropdownMenuItem onClick={() => deleteReservation(selectedRes.id)} className="rounded-xl px-4 py-2 text-rose-500 font-bold focus:bg-rose-50 cursor-pointer">
                             Destroy Reservation
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">System Access Only</p>
                  </div>

                  <Button variant="ghost" className="rounded-2xl font-black text-slate-400 hover:text-slate-600 h-14 px-8" onClick={() => setSelectedRes(null)}>
                     Dismiss
                  </Button>

                  {selectedRes?.status === 'PENDING' && (
                    <>
                      <Button onClick={() => updateStatus(selectedRes.id, 'CONFIRMED')} className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-black px-10 h-14 shadow-xl shadow-emerald-100 hover:-translate-y-1 transition-all">
                         Accept Request
                      </Button>
                      <Button onClick={() => updateStatus(selectedRes.id, 'CANCELLED')} className="rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-black px-8 h-14 transition-all">
                         Reject
                      </Button>
                    </>
                  )}
                  {selectedRes?.status === 'CONFIRMED' && (
                    <Button onClick={() => updateStatus(selectedRes.id, 'COMPLETED')} className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-black px-10 h-14 shadow-xl shadow-blue-100 hover:-translate-y-1 transition-all">
                       Finalize Session
                    </Button>
                  )}
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}
