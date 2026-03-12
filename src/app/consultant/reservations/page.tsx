'use client'

import { useEffect, useState } from 'react'
import { JoinZoomButton } from '@/components/JoinZoomButton'

export default function ConsultantReservations() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()))
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    fetchReservations()
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
      setReservations(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const getReservationForSlot = (dayIndex: number, hour: string) => {
    const slotDate = new Date(currentWeekStart)
    slotDate.setDate(slotDate.getDate() + dayIndex)
    const [slotHour] = hour.split(':')
    
    return reservations.find(res => {
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
                        <td key={time} className="border p-2 text-center">
                          {reservation ? (
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
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Reservation Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-gray-600 text-sm">Client:</span>
                <div className="font-medium">{selectedReservation.client.name || selectedReservation.client.email}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Service:</span>
                <div className="font-medium">{selectedReservation.serviceTier.service.name}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Tier:</span>
                <div className="font-medium">{selectedReservation.serviceTier.tierType}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Time:</span>
                <div className="font-medium">
                  {new Date(selectedReservation.startTime).toLocaleString()} - {new Date(selectedReservation.endTime).toLocaleTimeString()}
                </div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Current Status:</span>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReservation.status)} text-white`}>
                    {selectedReservation.status}
                  </span>
                </div>
              </div>
              {selectedReservation.zoomJoinUrl && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <span className="text-blue-800 text-sm font-semibold mb-2 block">Zoom Meeting Details:</span>
                  <div className="space-y-2">
                    {selectedReservation.zoomPassword && (
                      <div className="text-sm">
                        <span className="text-gray-600">Password:</span>{' '}
                        <code className="bg-white px-2 py-0.5 rounded border">{selectedReservation.zoomPassword}</code>
                      </div>
                    )}
                    <JoinZoomButton joinUrl={selectedReservation.zoomJoinUrl} className="w-full justify-center" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Change Status:</div>
              <div className="grid grid-cols-2 gap-3">
                {selectedReservation.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedReservation.id, 'CONFIRMED')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      ✓ Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(selectedReservation.id, 'CANCELLED')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      ✗ Cancel
                    </button>
                  </>
                )}
                {selectedReservation.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedReservation.id, 'COMPLETED')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      ✓ Complete
                    </button>
                    <button
                      onClick={() => updateStatus(selectedReservation.id, 'NO_SHOW')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      No Show
                    </button>
                  </>
                )}
                {(selectedReservation.status === 'COMPLETED' || selectedReservation.status === 'CANCELLED' || selectedReservation.status === 'NO_SHOW') && (
                  <div className="col-span-2 text-center text-gray-500 py-2">
                    This reservation is finalized
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
