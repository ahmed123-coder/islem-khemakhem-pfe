'use client'

import { useEffect, useState, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { JoinZoomButton } from '@/components/JoinZoomButton'

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export default function ConsultantReservations() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()).getTime())
  const [selectedReservation, setSelectedReservation] = useState<any>(null)

  const DAYS = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [currentWeekStart])

  useEffect(() => {
    fetchReservations()
    const handleNotification = (e: any) => {
      if (e.detail?.type === 'RESERVATION') fetchReservations()
    }
    window.addEventListener('notification', handleNotification)
    return () => window.removeEventListener('notification', handleNotification)
  }, [])

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/consultant/reservations')
      const data = await res.json()
      setReservations(Array.isArray(data) ? data : [])
    } catch { setReservations([]) }
    finally { setLoading(false) }
  }

  const getReservationAt = (date: Date, hour: number) => {
    return reservations.find(r => {
      const rStart = new Date(r.startTime)
      const rEnd = new Date(r.endTime)
      const cellStart = new Date(date); cellStart.setHours(hour, 0, 0, 0)
      const cellEnd = new Date(date); cellEnd.setHours(hour + 1, 0, 0, 0)
      return rStart.toDateString() === date.toDateString() && cellStart < rEnd && cellEnd > rStart
    })
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/consultant/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    fetchReservations()
    setSelectedReservation((prev: any) => prev ? { ...prev, status } : null)
  }

  const deleteReservation = async (id: string) => {
    if (!confirm('Supprimer cette réservation ?')) return
    await fetch('/api/consultant/reservations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setSelectedReservation(null)
    fetchReservations()
  }

  const changeWeek = (dir: number) => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + dir * 7)
    setCurrentWeekStart(d.getTime())
  }

  const canJoin = (r: any) => {
    const now = new Date().getTime()
    const start = new Date(r.startTime).getTime()
    const end = new Date(r.endTime).getTime()
    return now >= start - 15 * 60 * 1000 && now <= end
  }

  const getBg = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500'
      case 'PENDING': return 'bg-amber-400'
      case 'COMPLETED': return 'bg-blue-500'
      case 'CANCELLED': return 'bg-red-400'
      case 'NO_SHOW': return 'bg-purple-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      case 'NO_SHOW': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const weekEnd = new Date(currentWeekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Planning hebdomadaire</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => changeWeek(-1)} className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50">← Semaine précédente</button>
            <span className="text-sm font-semibold text-gray-700">
              {new Date(currentWeekStart).toLocaleDateString('fr-FR')} – {weekEnd.toLocaleDateString('fr-FR')}
            </span>
            <button onClick={() => changeWeek(1)} className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50">Semaine suivante →</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <th className="p-4 text-left font-semibold text-sm border-r border-blue-400 min-w-[120px]">Jour</th>
                {HOURS.map(h => (
                  <th key={h} className="p-4 text-center font-semibold text-sm border-r border-blue-400 min-w-[80px]">{h}h</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIndex) => (
                <tr key={dayIndex} className="border-b border-gray-100">
                  <td className="p-4 border-r border-gray-200 bg-gray-50/50">
                    <div className="font-bold text-gray-900 text-sm">{day.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}</div>
                    <div className="text-xs text-gray-400">{day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                  </td>
                  {(() => {
                    const cells = []
                    let i = 0
                    while (i < HOURS.length) {
                      const hour = HOURS[i]
                      const res = getReservationAt(day, hour)

                      if (res) {
                        const resStart = new Date(res.startTime).getHours()
                        const resEnd = new Date(res.endTime).getHours()
                        let span = 0
                        while (i + span < HOURS.length && HOURS[i + span] >= resStart && HOURS[i + span] < resEnd) span++
                        if (span === 0) span = 1

                        cells.push(
                          <td key={hour} colSpan={span} className="h-14 p-1 border-r border-gray-100 relative group">
                            <div
                              onClick={() => setSelectedReservation(res)}
                              className={`${getBg(res.status)} h-full rounded-lg flex flex-col items-center justify-center cursor-pointer hover:brightness-110 transition-all shadow-sm`}
                            >
                              <span className="text-white font-bold text-[11px] uppercase tracking-wide">{res.client?.name || 'Client'}</span>
                              <span className="text-white/80 text-[10px]">{resStart}h – {resEnd}h</span>
                            </div>
                            {/* Hover popover */}
                            <div className="hidden group-hover:block absolute z-50 bottom-full left-0 mb-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 text-left pointer-events-none">
                              <div className="font-bold text-gray-900 text-xs mb-1">{res.client?.name || res.client?.email}</div>
                              <div className="text-gray-500 text-[10px] mb-2">{res.serviceTier?.service?.name} — {res.serviceTier?.tierType}</div>
                              <div className="flex gap-2 items-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(res.status)}`}>{res.status}</span>
                                <span className="text-[9px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border">{resStart}h – {resEnd}h</span>
                              </div>
                              <div className="absolute top-full left-4 border-8 border-transparent border-t-white"></div>
                            </div>
                          </td>
                        )
                        i += span
                      } else {
                        cells.push(
                          <td key={hour} className="h-14 p-1 border-r border-gray-100 min-w-[80px]">
                            <div className="w-full h-full rounded-lg flex items-center justify-center">
                              <span className="text-gray-200 text-base font-bold">○</span>
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
        <div className="flex gap-6 px-1">
          {[['bg-amber-400', 'En attente'], ['bg-emerald-500', 'Confirmé'], ['bg-blue-500', 'Terminé'], ['bg-red-400', 'Annulé'], ['bg-purple-400', 'No Show']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${color}`}></div>
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedReservation(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`p-6 text-white ${
              selectedReservation.status === 'CONFIRMED' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
              selectedReservation.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
              selectedReservation.status === 'COMPLETED' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
              selectedReservation.status === 'CANCELLED' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
              'bg-gradient-to-r from-purple-500 to-violet-600'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Détails de la réservation</h2>
                  <p className="text-white/80 text-sm mt-1">{selectedReservation.serviceTier?.service?.name} — {selectedReservation.serviceTier?.tierType}</p>
                </div>
                <button onClick={() => setSelectedReservation(null)} className="text-white/70 hover:text-white text-2xl font-bold leading-none">&times;</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Client */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(selectedReservation.client?.name || selectedReservation.client?.email || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{selectedReservation.client?.name || 'Client'}</div>
                  <div className="text-xs text-gray-500">{selectedReservation.client?.email}</div>
                </div>
              </div>

              {/* Status & Time */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedReservation.status)}`}>{selectedReservation.status}</span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedReservation.startTime).toLocaleDateString('fr-FR')} · {new Date(selectedReservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(selectedReservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Zoom */}
              {selectedReservation.status === 'CONFIRMED' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-bold text-blue-700">Zoom Meeting</span>
                  </div>
                  {selectedReservation.zoomJoinUrl ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-xs text-gray-600 bg-white p-2 rounded-lg border border-blue-200 font-mono truncate">{selectedReservation.zoomJoinUrl}</div>
                      <button onClick={() => { navigator.clipboard.writeText(selectedReservation.zoomJoinUrl); toast.success('Lien copié!') }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold">📋</button>
                    </div>
                  ) : <p className="text-xs text-gray-400 italic">Lien en attente...</p>}
                  {selectedReservation.zoomPassword && (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm text-gray-800 bg-white p-2 rounded-lg border border-blue-200 font-bold">{selectedReservation.zoomPassword}</code>
                      <button onClick={() => { navigator.clipboard.writeText(selectedReservation.zoomPassword); toast.success('Mot de passe copié!') }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold">📋</button>
                    </div>
                  )}
                  {selectedReservation.zoomJoinUrl && canJoin(selectedReservation) && (
                    <JoinZoomButton joinUrl={selectedReservation.zoomJoinUrl} className="w-full justify-center" />
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4 space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Changer le statut</div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedReservation.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(selectedReservation.id, 'CONFIRMED')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm">✓ Confirmer</button>
                      <button onClick={() => updateStatus(selectedReservation.id, 'CANCELLED')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm">✗ Annuler</button>
                    </>
                  )}
                  {selectedReservation.status === 'CONFIRMED' && (
                    <>
                      <button onClick={() => updateStatus(selectedReservation.id, 'COMPLETED')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm">✓ Terminer</button>
                      <button onClick={() => updateStatus(selectedReservation.id, 'NO_SHOW')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm">⊘ No Show</button>
                    </>
                  )}
                  {['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(selectedReservation.status) && (
                    <div className="col-span-2 text-center text-gray-400 py-2 text-sm italic">Réservation finalisée</div>
                  )}
                </div>
                <button onClick={() => deleteReservation(selectedReservation.id)} className="w-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 py-2.5 rounded-xl text-sm font-bold">
                  🗑 Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
