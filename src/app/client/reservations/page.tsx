'use client'

import { useEffect, useState } from 'react'
import { JoinZoomButton } from '@/components/JoinZoomButton'

export default function ClientReservations() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // The orders endpoint conveniently returns both orders and reservations for the client
      const res = await fetch('/api/client/orders')
      const data = await res.json()
      setReservations(data.reservations || [])
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      case 'NO_SHOW': return 'bg-gray-100 text-gray-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  const canJoin = (reservation: any) => {
    const now = new Date()
    const start = new Date(reservation.startTime)
    const end = new Date(reservation.endTime)
    
    // Time before meeting when the join button becomes active (15 minutes)
    const earlyAccessMs = 15 * 60 * 1000 
    
    return now.getTime() >= (start.getTime() - earlyAccessMs) && now.getTime() <= end.getTime()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Reservations</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {reservations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No reservations yet</p>
              <a href="/client/services" className="text-blue-600 hover:underline">
                Book a Consultation
              </a>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consultant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meeting</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map(reservation => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium">{reservation.serviceTier.service.name}</div>
                      <div className="text-sm text-gray-500">{reservation.serviceTier.tierType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{reservation.consultant.name}</div>
                      <div className="text-sm text-gray-500">{reservation.consultant.specialty}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{new Date(reservation.startTime).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(reservation.startTime).toLocaleTimeString()} - {new Date(reservation.endTime).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReservationStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {reservation.zoomJoinUrl && reservation.status === 'CONFIRMED' && canJoin(reservation) && (
                        <JoinZoomButton joinUrl={reservation.zoomJoinUrl} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
