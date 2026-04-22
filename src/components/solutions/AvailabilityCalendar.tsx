'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface Reservation {
  id: string
  startTime: string
  endTime: string
}

interface Consultant {
  id: string
  name: string
  reservations: Reservation[]
}

interface Selection {
  consultantId: string
  date: Date
  startTime: string // ISO string
  endTime: string // ISO string
  startHour: number
  endHour: number
}

interface AvailabilityCalendarProps {
  consultants: Consultant[]
  onSelect: (selection: Selection) => void
  scheduleStartDate: Date
  onNavigate: (days: number) => void
  onJumpToDate?: (date: Date) => void
  requiredDuration: number // in hours, e.g. 1.5
}

export default function AvailabilityCalendar({ 
  consultants, 
  onSelect, 
  scheduleStartDate,
  onNavigate,
  onJumpToDate,
  requiredDuration
}: AvailabilityCalendarProps) {
  const [localSelection, setLocalSelection] = useState<Selection | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setCurrentUser(data))
      .catch(() => {})
  }, [])

  // Slots in 30 minute increments (9:00 to 18:00)
  const slots = Array.from({ length: 18 }, (_, i) => i * 0.5 + 9)
  
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(scheduleStartDate)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + i)
    return d
  })

  const isSlotBlocked = (consultantId: string, date: Date, startHour: number, duration: number) => {
    const consultant = consultants.find(c => c.id === consultantId)
    if (!consultant) return { blocked: false }
    
    // Calculate start/end dates for the requested slot
    const slotStart = new Date(date)
    slotStart.setHours(Math.floor(startHour), (startHour % 1) * 60, 0, 0)
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 60 * 1000)

    // 15 minutes buffer in milliseconds
    const BUFFER_MS = 15 * 60 * 1000

    if (slotEnd.getHours() > 18 || (slotEnd.getHours() === 18 && slotEnd.getMinutes() > 0)) {
      return { blocked: true, reason: 'La séance se termine après 18h00' }
    }

    const overlap = consultant.reservations.find(r => {
      const resStart = new Date(r.startTime).getTime()
      const resEnd = new Date(r.endTime).getTime()
      
      return (slotStart.getTime() < resEnd + BUFFER_MS && slotEnd.getTime() > resStart - BUFFER_MS)
    })

    if (overlap) {
       return { 
         blocked: true, 
         reason: `Collision avec une réservation existante (${new Date(overlap.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(overlap.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})` 
       }
    }

    return { blocked: false }
  }

  const handleSlotClick = (consultantId: string, date: Date, startHour: number) => {
    const { blocked, reason } = isSlotBlocked(consultantId, date, startHour, requiredDuration)
    if (blocked) {
      toast.error(reason || "Ce créneau n'est pas disponible pour la durée choisie.")
      return
    }

    const slotStart = new Date(date)
    slotStart.setHours(Math.floor(startHour), (startHour % 1) * 60, 0, 0)
    
    // Ensure duration is a valid number
    const duration = isNaN(requiredDuration) || requiredDuration <= 0 ? 1.5 : requiredDuration
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 60 * 1000)

    // Check if dates are valid before toISOString()
    if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime())) {
      console.error("Invalid appointment dates detected", { slotStart, slotEnd })
      return
    }

    const sel: Selection = {
      consultantId,
      date,
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      startHour: startHour,
      endHour: startHour + duration
    }
    setLocalSelection(sel)
    onSelect(sel)
  }

  const formatTime = (hour: number) => {
    const h = Math.floor(hour)
    const m = (hour % 1) * 60
    return `${h}:${m === 0 ? '00' : m}`
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Table des rendez-vous header inspired by image */}
      <div className="bg-[#FAF9F6] border-2 border-amber-100 rounded-[2rem] p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 flex gap-2">
           <div className="w-6 h-6 border-2 border-blue-500/20 rounded flex items-center justify-center text-[10px] text-blue-500 font-bold">⤢</div>
           <div className="w-6 h-6 border-2 border-red-500/20 rounded flex items-center justify-center text-[10px] text-red-500 font-bold">✕</div>
        </div>

        <div className="flex flex-col xl:flex-row gap-10 items-start">
          {/* Photo Section */}
          <div className="w-32 h-40 bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden flex-shrink-0 relative group">
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
             <div className="w-full h-full flex items-center justify-center text-gray-300">
               <svg className="w-20 h-20 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
             </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10">
             {/* Patient info row */}
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Id client</label>
                <div className="bg-amber-100/40 border border-amber-200/50 rounded-xl px-4 py-3 font-bold text-gray-700 flex items-center text-sm">
                  {currentUser?.id?.slice(-8).toUpperCase() || 'P-432FDEB'}
                </div>
             </div>

             <div className="space-y-2 lg:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Prénom et Nom du client</label>
                <div className="bg-amber-100/40 border border-amber-200/50 rounded-xl px-4 py-3 font-bold text-gray-700 flex items-center text-sm">
                  {currentUser?.name || 'Veuillez vous connecter'}
                </div>
             </div>

             {/* Appointment details row */}
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Date RDV</label>
                <div className="relative">
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduleStartDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value && onJumpToDate) {
                        onJumpToDate(new Date(e.target.value))
                      }
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-blue-600 flex items-center text-sm shadow-sm ring-1 ring-black/5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Heure Début</label>
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 flex items-center text-sm shadow-sm">
                  {localSelection ? new Date(localSelection.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-- : --'}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Heure Fin</label>
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 flex items-center text-sm shadow-sm">
                  {localSelection ? new Date(localSelection.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-- : --'}
                </div>
             </div>

             <div className="space-y-2 lg:col-span-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Observation</label>
                <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500 flex items-center min-h-[60px] italic shadow-inner">
                  {localSelection 
                    ? `Réservation d'une session de consulting de ${requiredDuration}h avec un expert sélectionné.`
                    : 'Sélectionnez un créneau horaire sur le calendrier pour voir les détails ici.'
                  }
                </div>
             </div>
          </div>

          {/* Action column (inspired by buttons in image) */}
          <div className="flex flex-col gap-3 w-full lg:w-48">
             <button disabled={!localSelection} className={cn(
               "w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
               localSelection ? "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5" : "bg-gray-200 text-gray-400 cursor-not-allowed"
             )}>
               Ajouter RDV
             </button>
             <button className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 opacity-50 cursor-not-allowed">
               Modifier RDV
             </button>
             <button onClick={() => setLocalSelection(null)} className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors">
               Réinitialiser
             </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-10 mb-16">
        {/* Date Nav */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate(-7)} 
            disabled={scheduleStartDate <= new Date(new Date().setHours(0,0,0,0))} 
            className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed group shadow-sm"
          >
            <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
            <div className="relative flex flex-col items-center px-12 py-6 bg-white border border-blue-100 rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.08)] min-w-[320px]">
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-2">Période disponible</div>
              <div className="text-3xl font-serif font-black text-gray-900 flex items-center gap-4">
                <span className="text-2xl">📅</span>
                {(() => {
                  const endDate = new Date(dates[6])
                  const startStr = scheduleStartDate.toLocaleDateString('fr-FR', { day: 'numeric' })
                  const endStr = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  if (scheduleStartDate.getMonth() !== endDate.getMonth()) {
                    const startMonth = scheduleStartDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    return `${startMonth} — ${endStr}`
                  }
                  return `${startStr} — ${endStr}`
                })()}
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate(7)} 
            className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-xl transition-all group shadow-sm"
          >
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid gap-12">
        {consultants.map(consultant => (
          <div key={consultant.id} className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {consultant.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{consultant.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Expert Consultant</p>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-[2rem] border border-gray-50 shadow-inner">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400">
                    <th className="p-4 text-left font-black text-[9px] uppercase tracking-widest bg-white/80 sticky left-0 z-20 backdrop-blur-md border-b border-r border-gray-100">Date</th>
                    {slots.map(s => (
                      <th key={s} className="p-3 text-center font-black text-[9px] uppercase tracking-widest border-b border-gray-100 min-w-[70px]">
                        {formatTime(s)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dates.map(date => (
                    <tr key={date.toISOString()} className="group/row">
                      <td className="p-4 font-bold bg-white/80 border-r border-b border-gray-100 group-hover/row:bg-blue-50 transition-colors sticky left-0 z-10 backdrop-blur-md">
                        <div className="text-[10px] text-gray-900 uppercase tracking-tighter">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                        <div className="text-[11px] text-blue-600 font-black">{date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                      </td>
                      {slots.map(slot => {
                        const { blocked } = isSlotBlocked(consultant.id, date, slot, requiredDuration)
                        const isPast = new Date(date).setHours(Math.floor(slot), (slot % 1) * 60) < new Date().getTime()
                        const isDisabled = blocked || isPast
                        
                        const isSelected = localSelection?.consultantId === consultant.id && 
                                         new Date(localSelection?.startTime).getTime() <= new Date(date).setHours(Math.floor(slot), (slot % 1) * 60) &&
                                         new Date(localSelection?.endTime).getTime() > new Date(date).setHours(Math.floor(slot), (slot % 1) * 60)
                        
                        return (
                          <td key={slot}
                            onClick={() => { if (!isDisabled) handleSlotClick(consultant.id, date, slot) }}
                            className={cn(
                              "p-3 text-center transition-all duration-300 select-none border-r border-b border-gray-50 cursor-pointer",
                              isDisabled ? "bg-gray-50/70 text-gray-200 cursor-not-allowed opacity-40" : "",
                              isSelected 
                                ? "bg-blue-600 text-white shadow-xl scale-[1.05] z-30 rounded-xl ring-4 ring-blue-100" 
                                : "hover:bg-blue-50/50"
                            )}
                          >
                           <div className="flex flex-col items-center justify-center">
                              {isSelected ? (
                                <svg className="w-3.5 h-3.5 animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                              ) : blocked ? (
                                <span className="text-[10px]">✕</span>
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/row:bg-blue-200 transition-colors" />
                              )}
                           </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-blue-600" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sélection ({requiredDuration}h)</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-gray-50 border border-gray-200" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Libre</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-gray-100 opacity-40 text-gray-300 items-center justify-center flex text-[8px]">✕</div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Indisponible</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
