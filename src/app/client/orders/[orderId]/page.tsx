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
  const [selectedRes, setSelectedRes] = useState<any>(null)
  const [pendingSlot, setPendingSlot] = useState<{ day: Date; startHour: number; endHour: number } | null>(null)
  const [dragStart, setDragStart] = useState<{ day: Date; hour: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ day: Date; hour: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
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

      const handleGlobalNotification = (e: any) => {
        const detail = e.detail
        if (detail?.orderId === orderId) {
          if (detail?.type === 'RESERVATION') {
            fetchReservations()
          } else if (detail?.type === 'ORDER') {
            fetchOrder()
          } else if (detail?.type === 'MISSION') {
            fetchOrder()
          }
        }
      }
      window.addEventListener('notification', handleGlobalNotification)

      return () => {
        socket.off('new_message', handleNewMessage)
        window.removeEventListener('notification', handleGlobalNotification)
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

  const bookReservation = async (date: Date, startHour: number, endHour: number, meetingType: 'ZOOM' | 'SUR_PLACE') => {
    if (order.status !== 'ACTIVE' || reserving) return

    const startTime = new Date(date)
    startTime.setHours(startHour, 0, 0, 0)
    const endTime = new Date(date)
    endTime.setHours(endHour, 0, 0, 0)

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
          endTime: endTime.toISOString(),
          meetingType
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
      toast.error('Une erreur est survenue')
    } finally {
      setReserving(false)
    }
  }

  const cancelReservation = async (id: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette session ?')) return
    try {
      const res = await fetch('/api/client/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        toast.success('Réservation annulée')
        fetchReservations()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de l\'annulation')
      }
    } catch (error) {
      console.error(error)
      toast.error('Une erreur est survenue')
    }
  }

  const getReservationAt = (date: Date, hour: number) => {
    return reservations.find(r => {
      const rStart = new Date(r.startTime)
      const rEnd = new Date(r.endTime)
      const cellStart = new Date(date)
      cellStart.setHours(hour, 0, 0, 0)
      const cellEnd = new Date(date)
      cellEnd.setHours(hour + 1, 0, 0, 0)
      return rStart.toDateString() === date.toDateString() &&
             cellStart < rEnd && cellEnd > rStart
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
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
      case 'NO_SHOW': return 'bg-purple-100 text-purple-700'
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
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
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
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  reservation.meetingType === 'SUR_PLACE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {reservation.meetingType === 'SUR_PLACE' ? '🏢 Sur Place' : '🎥 Zoom'}
                                </span>
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
                                  <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs text-gray-400 italic">
                                      {reservation.status === 'CONFIRMED' ? 'Available 15m before' : 'Pending Confirmation'}
                                    </span>
                                    {reservation.status === 'PENDING' && (
                                      <button 
                                        onClick={() => cancelReservation(reservation.id)}
                                        className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider underline"
                                      >
                                        Cancel Request
                                      </button>
                                    )}
                                  </div>
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
                    <table className="min-w-full border-collapse" onMouseLeave={() => setIsDragging(false)}>
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="p-4 text-gray-500 font-semibold text-left text-sm border-r">Day</th>
                          {HOURS.map(hour => (
                            <th key={hour} className="p-4 text-gray-500 font-semibold text-center text-sm border-r">
                              {hour}:00
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((day, dayIndex) => (
                          <tr key={dayIndex} className="border-b">
                            <td className="p-4 border-r border-gray-200 bg-gray-50/50 min-w-[120px]">
                              <div className="font-bold text-gray-900 text-sm">{day.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}</div>
                              <div className="text-xs text-gray-400">{day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                            </td>
                            {(() => {
                              const cells = []
                              let i = 0
                              while (i < HOURS.length) {
                                const hour = HOURS[i]
                                const res = getReservationAt(day, hour)
                                const isPast = new Date(day).setHours(hour) < new Date().getTime()
                                const isSelectable = !res && order.status === 'ACTIVE' && !isPast
                                const isSameDay = dragStart && dragStart.day.toDateString() === day.toDateString()
                                const isInDrag = isSameDay && dragStart && dragEnd && hour >= dragStart.hour && hour <= dragEnd.hour

                                if (res) {
                                  // Count how many consecutive hours this reservation spans in HOURS
                                  const resStart = new Date(res.startTime).getHours()
                                  const resEnd = new Date(res.endTime).getHours()
                                  let span = 0
                                  while (i + span < HOURS.length && HOURS[i + span] >= resStart && HOURS[i + span] < resEnd) span++
                                  if (span === 0) span = 1

                                  const isOwn = res.orderId === orderId
                                  let bgColor = ''
                                  if (res.status === 'CONFIRMED') bgColor = 'bg-emerald-500'
                                  else if (res.status === 'PENDING') bgColor = 'bg-amber-400'
                                  else if (res.status === 'COMPLETED') bgColor = 'bg-blue-500'
                                  else if (res.status === 'CANCELLED') bgColor = 'bg-red-400'
                                  else if (res.status === 'NO_SHOW') bgColor = 'bg-purple-400'

                                  cells.push(
                                    <td
                                      key={hour}
                                      colSpan={span}
                                      className="h-14 p-1 border-r border-gray-100 relative group"
                                      onClick={() => isOwn && setSelectedRes(res)}
                                    >
                                      <div className={`${bgColor} h-full rounded-lg flex flex-col items-center justify-center ${
                                        isOwn ? 'cursor-pointer' : 'cursor-help'
                                      } hover:brightness-110 transition-all shadow-sm`}>
                                        <span className="text-white font-bold text-[11px] uppercase tracking-wide">
                                          {isOwn ? 'Moi' : 'Occupé'}
                                        </span>
                                        <span className="text-white/80 text-[10px]">
                                          {resStart}h – {resEnd}h
                                        </span>
                                      </div>
                                      {/* Hover Popover */}
                                      <div className="hidden group-hover:block absolute z-50 bottom-full left-0 mb-2 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 text-left pointer-events-none">
                                        <div className="font-bold text-gray-900 text-xs mb-1">{isOwn ? 'Ma session' : 'Créneau occupé'}</div>
                                        {isOwn && <div className="text-gray-500 text-[10px] mb-2">{order.serviceTier.service.name}</div>}
                                        <div className="flex gap-2 items-center">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getReservationStatusColor(res.status)}`}>{res.status}</span>
                                          <span className="text-[9px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border">{resStart}h – {resEnd}h</span>
                                        </div>
                                        <div className="absolute top-full left-4 border-8 border-transparent border-t-white"></div>
                                      </div>
                                    </td>
                                  )
                                  i += span
                                } else {
                                  cells.push(
                                    <td
                                      key={hour}
                                      className="h-14 p-1 border-r border-gray-100 min-w-[80px] group select-none"
                                      onMouseDown={() => {
                                        if (!isSelectable) return
                                        setDragStart({ day, hour })
                                        setDragEnd({ day, hour })
                                        setIsDragging(true)
                                      }}
                                      onMouseEnter={() => {
                                        if (isDragging && dragStart && dragStart.day.toDateString() === day.toDateString() && hour >= dragStart.hour) {
                                          setDragEnd({ day, hour })
                                        }
                                      }}
                                      onMouseUp={() => {
                                        if (isDragging && dragStart && dragEnd) {
                                          setPendingSlot({ day: dragStart.day, startHour: dragStart.hour, endHour: dragEnd.hour + 1 })
                                        }
                                        setIsDragging(false)
                                        setDragStart(null)
                                        setDragEnd(null)
                                      }}
                                    >
                                      <div className={`w-full h-full rounded-lg flex items-center justify-center transition-all ${
                                        isPast ? 'cursor-not-allowed' :
                                        isInDrag ? 'bg-blue-500 cursor-pointer' :
                                        isSelectable ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-not-allowed'
                                      }`}>
                                        <span className={`text-base font-bold ${
                                          isPast ? 'text-gray-200' :
                                          isInDrag ? 'text-white' :
                                          'text-gray-300 group-hover:text-blue-400'
                                        }`}>
                                          {isInDrag ? (hour === dragStart?.hour ? '▶' : '—') : '○'}
                                        </span>
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
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#a855f7]"></div>
                      <span className="text-sm font-medium text-gray-600">No Show</span>
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
                          <div className="flex-1">
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

                        {/* Progress Bar Section */}
                        {mission.milestones && mission.milestones.length > 0 && (
                          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progress to Completion</span>
                              <span className="text-sm font-black text-blue-600">
                                {Math.round((mission.milestones.filter((m: any) => m.status === 'COMPLETED').length / mission.milestones.length) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                              <div 
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                  Math.round((mission.milestones.filter((m: any) => m.status === 'COMPLETED').length / mission.milestones.length) * 100) === 100 
                                  ? 'bg-green-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.round((mission.milestones.filter((m: any) => m.status === 'COMPLETED').length / mission.milestones.length) * 100)}%` }}
                              ></div>
                            </div>
                            <div className="mt-2 text-[10px] text-gray-400 font-bold uppercase flex justify-between">
                              <span>{mission.milestones.filter((m: any) => m.status === 'COMPLETED').length} Tasks Done</span>
                              <span>{mission.milestones.length} Total Tasks</span>
                            </div>
                          </div>
                        )}

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

      {/* Meeting Type Selection Modal */}
      {pendingSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setPendingSlot(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Type de réunion</h2>
            <p className="text-sm text-gray-500 mb-6">
              {pendingSlot.day.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {pendingSlot.startHour}h – {pendingSlot.endHour}h
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { bookReservation(pendingSlot.day, pendingSlot.startHour, pendingSlot.endHour, 'ZOOM'); setPendingSlot(null) }}
                className="flex flex-col items-center gap-3 p-5 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <span className="text-3xl">🎥</span>
                <span className="font-bold text-gray-800 group-hover:text-blue-700">Zoom</span>
                <span className="text-xs text-gray-400 text-center">Réunion en ligne</span>
              </button>
              <button
                onClick={() => { bookReservation(pendingSlot.day, pendingSlot.startHour, pendingSlot.endHour, 'SUR_PLACE'); setPendingSlot(null) }}
                className="flex flex-col items-center gap-3 p-5 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <span className="text-3xl">🏢</span>
                <span className="font-bold text-gray-800 group-hover:text-green-700">Sur Place</span>
                <span className="text-xs text-gray-400 text-center">Réunion physique</span>
              </button>
            </div>
            <button onClick={() => setPendingSlot(null)} className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600">Annuler</button>
          </div>
        </div>
      )}

      {/* Reservation Detail Modal */}
      {selectedRes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedRes(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`p-6 text-white ${selectedRes.status === 'CONFIRMED' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : selectedRes.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : selectedRes.status === 'COMPLETED' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : selectedRes.status === 'CANCELLED' ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-purple-500 to-violet-600'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Reservation Details</h2>
                  <p className="text-white/80 text-sm mt-1">{order.serviceTier.service.name}</p>
                </div>
                <button onClick={() => setSelectedRes(null)} className="text-white/70 hover:text-white text-2xl font-bold leading-none">&times;</button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Status & Time */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getReservationStatusColor(selectedRes.status)}`}>
                  {selectedRes.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedRes.meetingType === 'SUR_PLACE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedRes.meetingType === 'SUR_PLACE' ? '🏢 Sur Place' : '🎥 Zoom'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedRes.startTime).toLocaleDateString()} · {new Date(selectedRes.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedRes.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Zoom Details for CONFIRMED */}
              {selectedRes.status === 'CONFIRMED' && selectedRes.meetingType !== 'SUR_PLACE' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-bold text-blue-700">Zoom Meeting</span>
                  </div>

                  {/* Join URL */}
                  {selectedRes.zoomJoinUrl ? (
                    <div>
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Meeting Link</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-xs text-gray-600 bg-white p-3 rounded-lg border border-blue-200 break-all font-mono truncate">
                          {selectedRes.zoomJoinUrl}
                        </div>
                        <button
                          onClick={() => copyToClipboard(selectedRes.zoomJoinUrl, 'Link')}
                          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-lg text-xs font-bold transition-colors"
                          title="Copy Link"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">Link pending generation...</div>
                  )}

                  {/* Password */}
                  {selectedRes.zoomPassword && (
                    <div>
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Meeting Password</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-gray-800 bg-white p-3 rounded-lg border border-blue-200 font-bold tracking-wider">
                          {selectedRes.zoomPassword}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedRes.zoomPassword, 'Password')}
                          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-lg text-xs font-bold transition-colors"
                          title="Copy Password"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Join Button */}
                  {selectedRes.zoomJoinUrl && canJoin(selectedRes) && (
                    <JoinZoomButton joinUrl={selectedRes.zoomJoinUrl} className="w-full justify-center" />
                  )}
                </div>
              )}

              {/* Sur Place message for CONFIRMED */}
              {selectedRes.status === 'CONFIRMED' && selectedRes.meetingType === 'SUR_PLACE' && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
                  <p className="text-2xl mb-2">🏢</p>
                  <p className="text-green-700 font-semibold">Réunion en présentiel confirmée</p>
                  <p className="text-green-600 text-sm mt-1">Contactez votre consultant pour les détails du lieu</p>
                </div>
              )}

              {/* Pending message */}
              {selectedRes.status === 'PENDING' && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                  <p className="text-yellow-700 text-sm font-medium">⏳ Waiting for consultant confirmation</p>
                  <p className="text-yellow-600 text-xs mt-1">Zoom details will appear once confirmed</p>
                </div>
              )}

              {/* Cancel button for pending */}
              {selectedRes.status === 'PENDING' && (
                <button
                  onClick={() => { cancelReservation(selectedRes.id); setSelectedRes(null) }}
                  className="w-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 py-2.5 rounded-xl transition text-sm font-bold"
                >
                  ✗ Cancel this Reservation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
