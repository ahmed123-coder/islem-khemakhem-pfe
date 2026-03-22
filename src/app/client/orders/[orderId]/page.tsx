'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { JoinZoomButton } from '@/components/JoinZoomButton'
import { getSocket } from '@/lib/socket-client'

export default function OrderDetails() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'reservations' | 'messages' | 'calls' | 'missions'>('reservations')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [reserving, setReserving] = useState(false)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Start from Monday
    return new Date(d.setDate(diff)).setHours(0, 0, 0, 0)
  })

  const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]
  const DAYS = useMemo(() => {
    const days = []
    const start = new Date(currentWeekStart)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  }, [currentWeekStart])

  useEffect(() => {
    fetchOrder()
    fetchReservations()
    fetchMessages()

    // Real-time socket integration
    const socket = getSocket()
    if (socket) {
      socket.emit('join:order', orderId)
      
      const handleNewMessage = (message: any) => {
        if (message.orderId === orderId) {
          setMessages(prev => {
            // Avoid duplicate messages if already re-fetched
            if (prev.some(m => m.id === message.id)) return prev
            return [...prev, message]
          })
          // Also update order to reflect message usage if needed
          fetchOrder()
        }
      }

      socket.on('new_message', handleNewMessage)
      return () => {
        socket.off('new_message', handleNewMessage)
      }
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}`)
      if (res.status === 403) {
        router.push('/client')
        return
      }
      const data = await res.json()
      setOrder(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const fetchReservations = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}/reservations`)
      const data = await res.json()
      setReservations(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}/messages`)
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error(error)
    }
  }

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      const res = await fetch('/api/client/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, status })
      })
      if (res.ok) {
        fetchOrder()
      }
    } catch (error) {
      console.error(error)
    }
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
    } catch (error) {
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  const bookReservation = async (date: Date, hour: number) => {
    if (order.status !== 'ACTIVE' || reserving) return

    const startTime = new Date(date)
    startTime.setHours(hour, 0, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(hour + 1, 0, 0, 0)

    // Basic client-side check if slot is in the past
    if (startTime < new Date()) {
      toast.error('Vous ne pouvez pas réserver un créneau dans le passé')
      return
    }

    setReserving(true)
    try {
      const res = await fetch(`/api/client/orders/${orderId}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startTime: startTime.toISOString(), 
          endTime: endTime.toISOString() 
        })
      })
      
      if (res.ok) {
        toast.success('Réservation demandée au consultant !')
        fetchReservations()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la réservation')
      }
    } catch (error) {
      console.error(error)
      toast.error('Une erreur est survenue')
    } finally {
      setReserving(false)
    }
  }

  const getReservationAt = (date: Date, hour: number) => {
    return reservations.find(r => {
      const rStart = new Date(r.startTime)
      return rStart.getDate() === date.getDate() && 
             rStart.getMonth() === date.getMonth() && 
             rStart.getFullYear() === date.getFullYear() &&
             rStart.getHours() === hour
    })
  }

  const canJoin = (reservation: any) => {
    const now = new Date()
    const start = new Date(reservation.startTime)
    const end = new Date(reservation.endTime)
    const earlyAccessMs = 15 * 60 * 1000 
    return now.getTime() >= (start.getTime() - earlyAccessMs) && now.getTime() <= end.getTime()
  }

  const myReservations = useMemo(() => {
    return reservations.filter(r => r.orderId === orderId)
  }, [reservations, orderId])

  const changeWeek = (direction: number) => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + direction * 7)
    setCurrentWeekStart(newStart.getTime())
  }

  const getWeekRangeLabel = () => {
    const start = new Date(currentWeekStart)
    const end = new Date(currentWeekStart)
    end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!order) return <div className="flex items-center justify-center min-h-screen">Order not found</div>

  const getStatusColor = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <button onClick={() => router.back()} className="mb-4 text-blue-600 hover:underline">
          ← Back to Orders
        </button>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{order.serviceTier.service.name}</h1>
              <p className="text-gray-600">{order.serviceTier.tierType} Tier</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Consultant:</span>
              <p className="font-medium">{order.consultant?.name || 'Not assigned'}</p>
              {order.consultant?.specialty && <p className="text-sm text-gray-500">{order.consultant.specialty}</p>}
            </div>
            <div>
              <span className="text-sm text-gray-600">Messages:</span>
              <p className="font-medium">{order.messagesUsed} / {order.serviceTier.maxMessages || '∞'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Call Minutes:</span>
              <p className="font-medium">{order.callMinutesUsed} / {order.serviceTier.maxCallDuration || '∞'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b flex">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-3 font-medium ${activeTab === 'reservations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              📅 Reservations ({reservations.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-3 font-medium ${activeTab === 'messages' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              💬 Messages ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('calls')}
              className={`px-6 py-3 font-medium ${activeTab === 'calls' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              📞 Calls ({order.calls?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-6 py-3 font-medium ${activeTab === 'missions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              🚀 Missions ({order.missions?.length || 0})
            </button>
          </div>

          <div className="p-6">
            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <div className="space-y-8">
                {/* My Reservations Table (from client/reservations page) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                     <h3 className="text-lg font-bold text-gray-800">My Sessions for this Order</h3>
                  </div>
                  {myReservations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic">No sessions booked yet for this order.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-center">Meeting</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {myReservations.map(reservation => (
                            <tr key={reservation.id}>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{new Date(reservation.startTime).toLocaleDateString()}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getReservationStatusColor(reservation.status)}`}>
                                  {reservation.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {reservation.zoomJoinUrl && reservation.status === 'CONFIRMED' && canJoin(reservation) ? (
                                  <JoinZoomButton joinUrl={reservation.zoomJoinUrl} />
                                ) : (
                                  <span className="text-xs text-gray-400 italic">
                                    {reservation.status === 'CONFIRMED' ? 'Available 15m before' : 'Pending Confirmation'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <hr className="border-gray-100" />

                {/* Weekly Schedule Grid */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Weekly Schedule</h2>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => changeWeek(-1)}
                        className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 flex items-center gap-2"
                      >
                        ← Previous Week
                      </button>
                      <span className="text-sm font-semibold">{getWeekRangeLabel()}</span>
                      <button 
                        onClick={() => changeWeek(1)}
                        className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 flex items-center gap-2"
                      >
                        Next Week →
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="p-4 text-gray-500 font-semibold text-left text-sm border-r">Day</th>
                          {HOURS.map(hour => (
                            <th key={hour} className="p-4 text-gray-500 font-semibold text-center text-sm border-r">
                              {hour}:00-{(hour + 1)}:00
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((day, dayIndex) => (
                          <tr key={dayIndex} className="border-b">
                            <td className="p-4 border-r border-gray-200 bg-gray-50/50">
                              <div className="font-bold text-gray-900">{day.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                              <div className="text-xs text-gray-400">{day.toLocaleDateString()}</div>
                            </td>
                            {HOURS.map(hour => {
                              const res = getReservationAt(day, hour)
                              const isConfirmed = res?.status === 'CONFIRMED'
                              const isPending = res?.status === 'PENDING'
                              const isCompleted = res?.status === 'COMPLETED'
                              const isCancelled = res?.status === 'CANCELLED'
                              const isOwn = res?.orderId === orderId
                              const isPast = new Date(day).setHours(hour) < new Date().getTime()
                              const isSelectable = !isConfirmed && !isPending && order.status === 'ACTIVE' && !isPast

                              let bgColor = ''
                              if (res) {
                                if (isConfirmed) bgColor = 'bg-[#10b981]'
                                if (isPending) bgColor = 'bg-[#f59e0b]'
                                if (isCompleted) bgColor = 'bg-[#3b82f6]'
                                if (isCancelled) bgColor = 'bg-[#ef4444]'
                              }

                              return (
                                <td key={hour} className="p-1 border-r border-gray-100 text-center min-w-[120px] h-20 relative">
                                  {res ? (
                                    <div className={`${bgColor} text-white p-2 rounded-lg text-[10px] leading-tight flex flex-col justify-center h-full shadow-sm`}>
                                      <div className="font-bold uppercase mb-1">
                                        {isOwn ? 'Your Session' : 'Reserved'}
                                      </div>
                                      <div className="opacity-90">
                                        {isOwn ? order.serviceTier.service.name : 'Occupied'}
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => isSelectable && bookReservation(day, hour)}
                                      disabled={!isSelectable || isPast || reserving}
                                      className={`w-full h-full group flex items-center justify-center transition-all ${isPast ? 'cursor-not-allowed' : 'hover:bg-blue-50'}`}
                                    >
                                      <span className="text-gray-300 group-hover:text-blue-400 group-hover:scale-150 transition-all font-bold">-</span>
                                    </button>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend */}
                  <div className="flex gap-6 mt-6 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#f59e0b]"></div>
                      <span className="text-sm font-medium text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#10b981]"></div>
                      <span className="text-sm font-medium text-gray-600">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#3b82f6]"></div>
                      <span className="text-sm font-medium text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#ef4444]"></div>
                      <span className="text-sm font-medium text-gray-600">Cancelled</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No messages yet</div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`p-3 rounded-lg ${msg.senderType === 'CLIENT' ? 'bg-blue-100 ml-12' : 'bg-gray-100 mr-12'}`}>
                        <div className="text-sm font-medium mb-1">{msg.senderType}</div>
                        <div>{msg.content}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
                {order.status === 'ACTIVE' && (
                  <div className="flex gap-2 border-t pt-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 border rounded-lg px-4 py-2"
                      disabled={sending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Calls Tab */}
            {activeTab === 'calls' && (
              <div>
                {!order.calls || order.calls.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No calls yet</div>
                ) : (
                  <div className="space-y-4">
                    {order.calls.map((call: any) => (
                      <div key={call.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{new Date(call.startedAt).toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Duration: {call.duration} minutes</div>
                          </div>
                          {call.recordingUrl && (
                            <a href={call.recordingUrl} target="_blank" className="text-blue-600 hover:underline text-sm">
                              🎧 Listen Recording
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Missions Tab */}
            {activeTab === 'missions' && (
              <div>
                {!order.missions || order.missions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No missions assigned yet</div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {order.missions.map((mission: any) => (
                      <div key={mission.id} className="border rounded-lg p-6 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{mission.title}</h3>
                            {mission.description && <p className="text-gray-600 mt-1">{mission.description}</p>}
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              mission.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                mission.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                            }`}>
                            {mission.status}
                          </span>
                        </div>

                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                            Milestones ({mission.milestones?.length || 0})
                          </h4>
                          <div className="space-y-3">
                            {mission.milestones?.map((milestone: any) => (
                              <div key={milestone.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <button
                                  onClick={() => updateMilestoneStatus(milestone.id, milestone.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${milestone.status === 'COMPLETED' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'
                                    }`}
                                >
                                  {milestone.status === 'COMPLETED' && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium ${milestone.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                    {milestone.title}
                                  </p>
                                  {milestone.description && (
                                    <p className="text-sm text-gray-500 truncate">{milestone.description}</p>
                                  )}
                                </div>
                                {milestone.dueDate && (
                                  <div className="text-right">
                                    <span className="text-xs font-medium text-gray-500 block">Due Date</span>
                                    <span className="text-sm text-gray-700">{new Date(milestone.dueDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
