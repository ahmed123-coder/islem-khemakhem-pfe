'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { JoinZoomButton } from '@/components/JoinZoomButton'

export default function ConsultantReservations() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()))
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const canJoin = (reservation: any) => {
    const now = new Date()
    const start = new Date(reservation.startTime)
    const end = new Date(reservation.endTime)
    
    // Time before meeting when the join button becomes active (15 minutes)
    const earlyAccessMs = 15 * 60 * 1000 
    
    return now.getTime() >= (start.getTime() - earlyAccessMs) && now.getTime() <= end.getTime()
  }

  useEffect(() => {
    fetchReservations()

    const handleNotification = (e: any) => {
      const detail = e.detail
      if (detail?.type === 'RESERVATION') {
        fetchReservations()
      }
    }

    window.addEventListener('notification', handleNotification)
    return () => window.removeEventListener('notification', handleNotification)
  }, [])

  function getMonday(date: Date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/consultant/reservations')
      const data = await res.json()
      setReservations(Array.isArray(data) ? data : [])
      setLoading(false)
    } catch (error) {
      setReservations([])
      setLoading(false)
    }
  }

  const getReservationForSlot = (dayIndex: number, hour: string) => {
    const slotDate = new Date(currentWeekStart)
    slotDate.setDate(slotDate.getDate() + dayIndex)
    const [slotHour] = hour.split(':')
    
    return (Array.isArray(reservations) ? reservations : []).find(res => {
      const start = new Date(res.startTime)
      return (
        start.getDate() === slotDate.getDate() &&
        start.getMonth() === slotDate.getMonth() &&
        start.getFullYear() === slotDate.getFullYear() &&
        start.getHours() === parseInt(slotHour)
      )
    })
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/consultant/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      fetchReservations()
    } catch (error) {
      console.error(error)
    }
  }

  const deleteReservation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation? This cannot be undone.')) return
    try {
      await fetch('/api/consultant/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setShowModal(false)
      setSelectedReservation(null)
      fetchReservations()
    } catch (error) {
      console.error(error)
    }
  }

  const changeWeek = (direction: number) => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeekStart(newDate)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500'
      case 'PENDING': return 'bg-yellow-500'
      case 'COMPLETED': return 'bg-blue-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'NO_SHOW': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Weekly Schedule</h1>
          <div className="flex gap-4 items-center">
            <button onClick={() => changeWeek(-1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              ← Previous Week
            </button>
            <span className="font-medium">
              {currentWeekStart.toLocaleDateString()} - {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </span>
            <button onClick={() => changeWeek(1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Next Week →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left font-semibold w-32">Day</th>
                {timeSlots.map(time => (
                  <th key={time} className="border p-3 text-center font-semibold">
                    {time}-{parseInt(time.split(':')[0]) + 1}:00
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIndex) => {
                const date = new Date(currentWeekStart)
                date.setDate(date.getDate() + dayIndex)
                
                return (
                  <tr key={day} className="hover:bg-gray-50">
                    <td className="border p-3 font-medium">
                      <div>{day}</div>
                      <div className="text-xs text-gray-500">{date.toLocaleDateString()}</div>
                    </td>
                    {timeSlots.map(time => {
                      const reservation = getReservationForSlot(dayIndex, time)
                      
                      return (
                        <td key={time} className="border p-2 text-center relative group">
                          {reservation ? (
                            <>
                              <div 
                                onClick={() => {
                                  setSelectedReservation(reservation)
                                  setShowModal(true)
                                }}
                                className={`${getStatusColor(reservation.status)} text-white p-2 rounded cursor-pointer hover:opacity-80 transition`}
                              >
                                <div className="text-xs font-medium">{reservation.client.name || 'Client'}</div>
                                <div className="text-xs">{reservation.serviceTier.service.name}</div>
                              </div>

                              {/* Hover Popover */}
                              <div className="hidden group-hover:block absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="text-gray-900 font-bold mb-1 text-sm">{reservation.client.name || reservation.client.email}</div>
                                <div className="text-gray-500 text-xs mb-3">{reservation.serviceTier.service.name} - {reservation.serviceTier.tierType}</div>
                                
                                <div className="flex gap-2 items-center mb-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] text-white font-bold ${getStatusColor(reservation.status)}`}>
                                    {reservation.status}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                                    {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                
                                {reservation.status === 'CONFIRMED' && (
                                  <div className="mt-2 pt-3 border-t border-gray-100 space-y-2">
                                    <div>
                                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Zoom Meeting URL</span>
                                      <div className="text-[10px] text-gray-500 break-all p-2 bg-blue-50/50 rounded border border-blue-100/50 font-mono">
                                        {reservation.zoomJoinUrl || 'Pending link generation...'}
                                      </div>
                                    </div>
                                    {reservation.zoomPassword && (
                                      <div>
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Meeting Password</span>
                                        <code className="text-[10px] text-gray-700 bg-gray-50 px-2 py-1 rounded border font-bold">
                                          {reservation.zoomPassword}
                                        </code>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Tooltip Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white drop-shadow-sm"></div>
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-300 text-2xl">-</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>No Show</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`p-6 text-white ${selectedReservation.status === 'CONFIRMED' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : selectedReservation.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : selectedReservation.status === 'COMPLETED' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : selectedReservation.status === 'CANCELLED' ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-purple-500 to-violet-600'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Reservation Details</h2>
                  <p className="text-white/80 text-sm mt-1">{selectedReservation.serviceTier.service.name} — {selectedReservation.serviceTier.tierType}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white text-2xl font-bold leading-none">&times;</button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Client Info */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg">
                  {(selectedReservation.client.name || selectedReservation.client.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{selectedReservation.client.name || 'Client'}</div>
                  <div className="text-xs text-gray-500">{selectedReservation.client.email}</div>
                </div>
              </div>

              {/* Status & Time */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(selectedReservation.status)}`}>
                  {selectedReservation.status}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedReservation.startTime).toLocaleDateString()} · {new Date(selectedReservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedReservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Zoom Details for CONFIRMED */}
              {selectedReservation.status === 'CONFIRMED' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-bold text-blue-700">Zoom Meeting</span>
                  </div>

                  {/* Join URL */}
                  {selectedReservation.zoomJoinUrl ? (
                    <div>
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Meeting Link</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-xs text-gray-600 bg-white p-3 rounded-lg border border-blue-200 break-all font-mono truncate">
                          {selectedReservation.zoomJoinUrl}
                        </div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(selectedReservation.zoomJoinUrl); toast.success('Link copied!') }}
                          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">Link pending generation...</div>
                  )}

                  {/* Password */}
                  {selectedReservation.zoomPassword && (
                    <div>
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Meeting Password</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-gray-800 bg-white p-3 rounded-lg border border-blue-200 font-bold tracking-wider">
                          {selectedReservation.zoomPassword}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(selectedReservation.zoomPassword); toast.success('Password copied!') }}
                          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Join Button */}
                  {selectedReservation.zoomJoinUrl && canJoin(selectedReservation) && (
                    <JoinZoomButton joinUrl={selectedReservation.zoomJoinUrl} className="w-full justify-center" />
                  )}
                </div>
              )}

              {/* Status Actions */}
              <div className="border-t pt-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Change Status</div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedReservation.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateStatus(selectedReservation.id, 'CONFIRMED')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition font-bold text-sm"
                      >
                        ✓ Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(selectedReservation.id, 'CANCELLED')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition font-bold text-sm"
                      >
                        ✗ Cancel
                      </button>
                    </>
                  )}
                  {selectedReservation.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => updateStatus(selectedReservation.id, 'COMPLETED')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition font-bold text-sm"
                      >
                        ✓ Complete
                      </button>
                      <button
                        onClick={() => updateStatus(selectedReservation.id, 'NO_SHOW')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl transition font-bold text-sm"
                      >
                        ⊘ No Show
                      </button>
                    </>
                  )}
                  {(selectedReservation.status === 'COMPLETED' || selectedReservation.status === 'CANCELLED' || selectedReservation.status === 'NO_SHOW') && (
                    <div className="col-span-2 text-center text-gray-400 py-2 text-sm italic">
                      This reservation is finalized
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => deleteReservation(selectedReservation.id)}
                    className="w-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 py-2.5 rounded-xl transition text-sm font-bold"
                  >
                    🗑 Delete Reservation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
