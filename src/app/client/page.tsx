'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { JoinZoomButton } from '@/components/JoinZoomButton'

export default function ClientSubscriptions() {
  const [orders, setOrders] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations'>('orders')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/client/orders')
      const data = await res.json()
      setOrders(data.orders || [])
      setReservations(data.reservations || [])
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

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
        <h1 className="text-3xl font-bold mb-8">My Subscriptions</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b flex">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-medium ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-3 font-medium ${activeTab === 'reservations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Reservations ({reservations.length})
            </button>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Link href="/client/services" className="text-blue-600 hover:underline">
                  Browse Services
                </Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{order.serviceTier.service.name}</h3>
                      <p className="text-gray-600">{order.serviceTier.tierType} Tier</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Consultant:</span>
                      <p className="font-medium">{order.consultant?.name || 'Not assigned'}</p>
                      {order.consultant?.specialty && (
                        <p className="text-sm text-gray-500">{order.consultant.specialty}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Messages Used:</span>
                      <p className="font-medium">{order.messagesUsed} / {order.serviceTier.maxMessages || '∞'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Call Minutes Used:</span>
                      <p className="font-medium">{order.callMinutesUsed} / {order.serviceTier.maxCallDuration || '∞'}</p>
                    </div>
                  </div>

                  {order.missions.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-2">Missions ({order.missions.length})</h4>
                      <div className="space-y-2">
                        {order.missions.map((mission: any) => (
                          <div key={mission.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <div>
                              <div className="font-medium">{mission.title}</div>
                              <div className="text-sm text-gray-500">
                                {mission.milestones.length} tasks - {mission.milestones.filter((m: any) => m.status === 'COMPLETED').length} completed
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              mission.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {mission.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Link 
                      href={`/client/orders/${order.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {reservations.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">No reservations yet</p>
                <Link href="/client/services" className="text-blue-600 hover:underline">
                  Book a Consultation
                </Link>
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
        )}
      </div>
    </div>
  )
}
