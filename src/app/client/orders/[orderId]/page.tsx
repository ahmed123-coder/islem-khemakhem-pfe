'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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

  useEffect(() => {
    fetchOrder()
    fetchReservations()
    fetchMessages()
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
              <div>
                {reservations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No reservations yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reservations.map(reservation => {
                          const start = new Date(reservation.startTime)
                          const end = new Date(reservation.endTime)
                          const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
                          
                          return (
                            <tr key={reservation.id}>
                              <td className="px-6 py-4 whitespace-nowrap">{start.toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {start.toLocaleTimeString()} - {end.toLocaleTimeString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{duration} min</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReservationStatusColor(reservation.status)}`}>
                                  {reservation.status}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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
                          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                            mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
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
                                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    milestone.status === 'COMPLETED' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'
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
