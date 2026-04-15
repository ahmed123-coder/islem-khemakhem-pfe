'use client'

import { useState, useEffect } from 'react'

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
  startHour: number
  endHour: number
}

interface AvailabilityCalendarProps {
  consultants: Consultant[]
  onSelect: (selection: Selection) => void
  scheduleStartDate: Date
  onNavigate: (days: number) => void
}

export default function AvailabilityCalendar({ 
  consultants, 
  onSelect, 
  scheduleStartDate,
  onNavigate
}: AvailabilityCalendarProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [localSelection, setLocalSelection] = useState<Selection | null>(null)

  const hours = Array.from({ length: 9 }, (_, i) => i + 9)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(scheduleStartDate)
    d.setDate(d.getDate() + i)
    return d
  })

  const isSlotBlocked = (consultantId: string, date: Date, hour: number, duration: number = 1) => {
    const consultant = consultants.find(c => c.id === consultantId)
    if (!consultant) return false
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(hour + duration, 0, 0, 0)
    return consultant.reservations.some(r => {
      const resStart = new Date(r.startTime)
      const resEnd = new Date(r.endTime)
      return (slotStart < resEnd && slotEnd > resStart)
    })
  }

  const handleSelectionUpdate = (sel: Selection) => {
    setLocalSelection(sel)
    onSelect(sel)
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
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
                  const endDate = new Date(scheduleStartDate)
                  endDate.setDate(endDate.getDate() + 6)
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
          <div key={consultant.id} className="group bg-white border border-gray-100 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {consultant.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{consultant.name}</h3>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Expert Consultant</p>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-inner">
              <table className="w-full border-collapse" onMouseLeave={() => setIsDragging(false)}>
                <thead>
                  <tr className="bg-gray-50 text-gray-400 border-b border-gray-100">
                    <th className="p-5 text-left font-black text-[10px] uppercase tracking-widest bg-gray-50/50 sticky left-0 z-10 backdrop-blur-sm">Calendrier</th>
                    {hours.map(h => (
                      <th key={h} className="p-5 text-center font-black text-[10px] uppercase tracking-widest whitespace-nowrap min-w-[80px]">
                        {h}h:00
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dates.map(date => (
                    <tr key={date.toISOString()} className="group/row">
                      <td className="p-5 font-bold bg-gray-50/30 border-r border-gray-50 group-hover/row:bg-blue-50/30 transition-colors sticky left-0 z-10 backdrop-blur-sm">
                        <div className="text-xs text-gray-900 uppercase tracking-tighter">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                        <div className="text-[10px] text-blue-500 font-black">{date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                      </td>
                      {hours.map(hour => {
                        const blocked = isSlotBlocked(consultant.id, date, hour)
                        const isPast = new Date(date).setHours(hour) < new Date().getTime()
                        const isDisabled = blocked || isPast
                        const isSelected = localSelection?.consultantId === consultant.id && 
                                         localSelection?.date.toDateString() === date.toDateString() && 
                                         hour >= localSelection.startHour && 
                                         hour < localSelection.endHour
                        
                        return (
                          <td key={hour}
                            onMouseDown={() => { if (!isDisabled) { handleSelectionUpdate({ consultantId: consultant.id, date, startHour: hour, endHour: hour + 1 }); setIsDragging(true) } }}
                            onMouseEnter={() => { if (isDragging && localSelection?.consultantId === consultant.id && localSelection?.date.toDateString() === date.toDateString() && hour >= localSelection.startHour) handleSelectionUpdate({ ...localSelection, endHour: hour + 1 }) }}
                            onMouseUp={() => setIsDragging(false)}
                            className={`p-4 text-center transition-all duration-300 select-none border-r border-b border-gray-50/50 ${
                              isDisabled
                                ? 'bg-gray-50/50 text-gray-200 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-600 text-white shadow-lg z-10 scale-[1.02] rounded-md font-bold'
                                : 'bg-white hover:bg-blue-50 group-hover/row:bg-blue-50/20 cursor-pointer'
                            }`}
                          >
                            {isDisabled ? '✕' : isSelected ? '✓' : ''}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
