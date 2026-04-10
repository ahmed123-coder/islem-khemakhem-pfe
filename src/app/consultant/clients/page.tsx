'use client'

import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket-client'

export default function ConsultantClients() {
  const [activeTab, setActiveTab] = useState<'clients' | 'messages' | 'missions' | 'calls' | 'reservations'>('clients')
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [missions, setMissions] = useState<any[]>([])
  const [calls, setCalls] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      const clientData = clients.find(c => c.id === selectedClient)
      fetchMessages(selectedClient)
      fetchMissions(selectedClient)
      fetchCalls(selectedClient)
      if (clientData?.clientId) {
        fetchReservations(clientData.clientId)
      }

      // Real-time socket integration
      const socket = getSocket()
      const room = `order:${selectedClient}`
      
      const handleNewMessage = (message: any) => {
        if (message.orderId === selectedClient) {
          setMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev
            return [...prev, message]
          })
        }
        
        setClients(prev => prev.map(c => {
          if (c.id === message.orderId) {
            return {
              ...c,
              messagesUsed: c.messagesUsed + 1
            }
          }
          return c
        }))
      }

      if (socket) {
        socket.emit('join:order', selectedClient)
        socket.on('new_message', handleNewMessage)
      }

      const handleGlobalNotification = (e: any) => {
        const detail = e.detail
        if (detail?.orderId === selectedClient) {
          if (detail?.type === 'ORDER_MESSAGE' || detail?.type === 'MESSAGE') {
            fetchMessages(selectedClient)
          } else if (detail?.type === 'RESERVATION') {
            const clientData = clients.find(c => c.id === selectedClient)
            if (clientData?.clientId) {
              fetchReservations(clientData.clientId)
            }
          } else if (detail?.type === 'MISSION') {
            fetchMissions(selectedClient)
          }
        }
      }
      window.addEventListener('notification', handleGlobalNotification)

      return () => {
        window.removeEventListener('notification', handleGlobalNotification)
        if (socket) {
          socket.off('new_message', handleNewMessage)
        }
      }
    }
  }, [selectedClient, clients])

  const canJoin = (reservation: any) => {
    const now = new Date()
    const start = new Date(reservation.startTime)
    const end = new Date(reservation.endTime)
    const earlyAccessMs = 15 * 60 * 1000 
    return now.getTime() >= (start.getTime() - earlyAccessMs) && now.getTime() <= end.getTime()
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/consultant/clients')
      const data = await res.json()
      setClients(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const fetchMessages = async (orderId: string) => {
    try {
      const res = await fetch(`/api/consultant/messages?orderId=${orderId}`)
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchCalls = async (orderId: string) => {
    try {
      const res = await fetch(`/api/consultant/calls?orderId=${orderId}`)
      const data = await res.json()
      setCalls(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchMissions = async (orderId: string) => {
    try {
      const res = await fetch(`/api/consultant/missions?orderId=${orderId}`)
      const data = await res.json()
      setMissions(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchReservations = async (clientId: string) => {
    try {
      const res = await fetch(`/api/consultant/reservations?clientId=${clientId}`)
      const data = await res.json()
      setReservations(data)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return
    try {
      const res = await fetch('/api/consultant/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reservationId })
      })
      if (res.ok) {
        if (selectedClient) {
          const clientData = clients.find(c => c.id === selectedClient)
          if (clientData?.clientId) {
            fetchReservations(clientData.clientId)
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return
    
    try {
      await fetch('/api/consultant/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedClient, content: newMessage })
      })
      setNewMessage('')
      fetchMessages(selectedClient)
    } catch (error) {
      console.error(error)
    }
  }

  const createMission = async () => {
    if (!selectedClient) return
    
    const title = prompt('Mission title:')
    if (!title) return

    try {
      await fetch('/api/consultant/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedClient, title })
      })
      fetchMissions(selectedClient)
    } catch (error) {
      console.error(error)
    }
  }

  const createMilestone = async (missionId: string) => {
    const title = prompt('Milestone title:')
    if (!title) return
    const description = prompt('Milestone description (optional):')

    try {
      await fetch('/api/consultant/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, title, description })
      })
      if (selectedClient) fetchMissions(selectedClient)
    } catch (error) {
      console.error(error)
    }
  }

  const updateMissionStatus = async (missionId: string, status: string) => {
    try {
      const mission = missions.find(m => m.id === missionId)
      if (!mission) return

      await fetch('/api/consultant/missions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, title: mission.title, description: mission.description, status })
      })
      if (selectedClient) fetchMissions(selectedClient)
    } catch (error) {
      console.error(error)
    }
  }

  const updateMission = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId)
    if (!mission) return

    const title = prompt('Mission title:', mission.title)
    if (!title) return
    const description = prompt('Mission description:', mission.description || '')

    try {
      await fetch('/api/consultant/missions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, title, description, status: mission.status })
      })
      if (selectedClient) fetchMissions(selectedClient)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteMission = async (missionId: string) => {
    if (!confirm('Are you sure you want to delete this mission?')) return
    try {
      await fetch('/api/consultant/missions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId })
      })
      if (selectedClient) fetchMissions(selectedClient)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteMilestone = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await fetch('/api/consultant/milestones', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId })
      })
      if (selectedClient) fetchMissions(selectedClient)
    } catch (error) {
      console.error(error)
    }
  }

  const editMilestone = async (milestoneId: string) => {
    let milestone: any = null
    for (const m of missions) {
      milestone = m.milestones.find((ms: any) => ms.id === milestoneId)
      if (milestone) break
    }
    if (!milestone) return

    const title = prompt('Milestone title:', milestone.title)
    if (!title) return
    const description = prompt('Milestone description:', milestone.description || '')

    try {
      await fetch('/api/consultant/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, title, description, status: milestone.status })
      })
      if (selectedClient) fetchMissions(selectedClient)
    } catch (error) {
      console.error(error)
    }
  }

  const updateMilestone = async (milestoneId: string, status: string) => {
    try {
      await fetch('/api/consultant/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, status })
      })
      if (selectedClient) fetchMissions(selectedClient)
    } catch (error) {
      console.error(error)
    }
  }

  const onDragStart = (e: React.DragEvent, milestoneId: string) => {
    e.dataTransfer.setData('milestoneId', milestoneId)
  }

  const onDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const milestoneId = e.dataTransfer.getData('milestoneId')
    if (!milestoneId) return
    await updateMilestone(milestoneId, status)
  }

  const onDragOver = (e: React.DragEvent) => e.preventDefault()

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const selectedClientData = clients.find(c => c.id === selectedClient)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Clients Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Clients ({clients.length})</h2>
            <div className="space-y-2">
              {clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedClient === client.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{client.client.name || client.client.email}</div>
                  <div className="text-sm text-gray-500">{client.serviceTier.service.name}</div>
                  <div className={`text-xs mt-1 ${client.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>
                    {client.status}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedClient ? (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-2">{selectedClientData?.client.name || 'Client'}</h2>
                  <p className="text-gray-600">{selectedClientData?.client.email}</p>
                  <div className="mt-4 flex gap-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {selectedClientData?.serviceTier.tierType}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {selectedClientData?.status}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="border-b flex">
                    <button
                      onClick={() => setActiveTab('messages')}
                      className={`px-6 py-3 font-medium ${activeTab === 'messages' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                      Messages
                    </button>
                    <button
                      onClick={() => setActiveTab('missions')}
                      className={`px-6 py-3 font-medium ${activeTab === 'missions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                      Missions
                    </button>
                    <button
                      onClick={() => setActiveTab('calls')}
                      className={`px-6 py-3 font-medium ${activeTab === 'calls' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                      Calls
                    </button>
                    <button
                      onClick={() => setActiveTab('reservations')}
                      className={`px-6 py-3 font-medium ${activeTab === 'reservations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                      Reservations
                    </button>
                  </div>

                  <div className="p-6">
                    {activeTab === 'messages' && (
                      <div>
                        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto p-2">
                          {messages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 italic">No messages yet.</div>
                          ) : (
                            messages.map(msg => (
                              <div key={msg.id} className={`p-3 rounded-lg shadow-sm ${msg.senderType === 'CONSULTANT' ? 'bg-blue-50 ml-12 border-l-4 border-blue-500' : 'bg-gray-100 mr-12 border-l-4 border-gray-400'}`}>
                                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">{msg.senderType}</div>
                                <div className="text-sm text-gray-800 break-words">{msg.content}</div>
                                <div className="text-[10px] text-gray-400 mt-2 text-right">{new Date(msg.createdAt).toLocaleString()}</div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button onClick={sendMessage} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                            Send
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'missions' && (
                      <div>
                        <button onClick={createMission} className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2">
                          <span className="text-xl">+</span> New Mission
                        </button>
                        {missions.length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                            No missions assigned yet.
                          </div>
                        ) : (
                          <div className="space-y-8">
                            {missions.map(mission => {
                              const done = mission.milestones.filter((m: any) => m.status === 'COMPLETED').length
                              const total = mission.milestones.length
                              const progress = total > 0 ? Math.round((done / total) * 100) : 0

                              const columns = [
                                { key: 'PENDING', label: 'Pending', color: 'bg-yellow-50 border-yellow-200', headerColor: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
                                { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
                                { key: 'COMPLETED', label: 'Completed', color: 'bg-green-50 border-green-200', headerColor: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
                              ]

                              return (
                                <div key={mission.id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                      <h3 className="font-bold text-gray-900 text-xl">{mission.title}</h3>
                                      {mission.description && <p className="text-gray-500 text-sm mt-1">{mission.description}</p>}
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                      <select
                                        value={mission.status}
                                        onChange={(e) => updateMissionStatus(mission.id, e.target.value)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer outline-none shadow-sm ${
                                          mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                          mission.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                          mission.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                          'bg-gray-100 text-gray-600'
                                        }`}
                                      >
                                        <option value="PENDING">Pending</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                      </select>
                                      <div className="flex gap-4">
                                        <button onClick={() => updateMission(mission.id)} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition">Update</button>
                                        <button onClick={() => deleteMission(mission.id)} className="text-xs font-medium text-red-500 hover:text-red-700 transition">Remove</button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="bg-gray-50 p-4 rounded-xl mb-5">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Progress</span>
                                      <span className="text-sm font-black text-blue-600">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-700 ease-out rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-400 text-right font-medium">{done} of {total} tasks completed</div>
                                  </div>

                                  {/* Kanban Board */}
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-sm text-gray-800">📋 Tasks Board</h4>
                                    <button onClick={() => createMilestone(mission.id)} className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                                      + ADD TASK
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                    {columns.map(col => (
                                      <div
                                        key={col.key}
                                        onDragOver={onDragOver}
                                        onDrop={(e) => onDrop(e, col.key)}
                                        className={`rounded-xl border-2 border-dashed ${col.color} min-h-[120px] p-2 transition-colors`}
                                      >
                                        <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-2 ${col.headerColor}`}>
                                          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                                          <span className="text-xs font-bold uppercase tracking-wide">{col.label}</span>
                                          <span className="ml-auto text-xs font-bold">
                                            {mission.milestones.filter((m: any) => m.status === col.key).length}
                                          </span>
                                        </div>
                                        <div className="space-y-2">
                                          {mission.milestones
                                            .filter((m: any) => m.status === col.key)
                                            .map((milestone: any) => (
                                              <div
                                                key={milestone.id}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, milestone.id)}
                                                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing group hover:shadow-md transition-shadow"
                                              >
                                                <div className="font-semibold text-sm text-gray-800 leading-snug">{milestone.title}</div>
                                                {milestone.description && (
                                                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{milestone.description}</p>
                                                )}
                                                {milestone.dueDate && (
                                                  <div className="text-[10px] text-gray-400 mt-1.5">📅 {new Date(milestone.dueDate).toLocaleDateString()}</div>
                                                )}
                                                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button onClick={() => editMilestone(milestone.id)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800">Edit</button>
                                                  <button onClick={() => deleteMilestone(milestone.id)} className="text-[10px] font-bold text-red-500 hover:text-red-700">Delete</button>
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'calls' && (
                      <div>
                        {calls.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">No calls recorded yet.</div>
                        ) : (
                          <div className="space-y-4">
                            {calls.map(call => (
                              <div key={call.id} className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-bold text-gray-800">{new Date(call.startedAt).toLocaleString()}</div>
                                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                      Duration: {call.duration} minutes
                                    </div>
                                  </div>
                                  {call.recordingUrl && (
                                    <a 
                                      href={call.recordingUrl} 
                                      target="_blank" 
                                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-bold flex items-center gap-2"
                                    >
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

                    {activeTab === 'reservations' && (
                      <div>
                        {reservations.length === 0 ? (
                          <div className="text-center py-12 text-gray-500 italic">No reservations found for this client.</div>
                        ) : (
                          <div className="overflow-hidden border border-gray-100 rounded-2xl">
                            <table className="min-w-full divide-y divide-gray-100">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</th>
                                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-50">
                                {reservations.map(res => (
                                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-bold text-gray-800">{res.serviceTier.service.name}</div>
                                      <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mt-0.5">{res.serviceTier.tierType}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-medium text-gray-700">{new Date(res.startTime).toLocaleDateString()}</div>
                                      <div className="text-xs text-gray-400 font-medium">
                                        {new Date(res.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                        res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                        res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                        res.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-500'
                                      }`}>
                                        {res.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                        {res.status === 'CONFIRMED' && res.zoomJoinUrl && canJoin(res) ? (
                                          <a 
                                            href={res.zoomJoinUrl} 
                                            target="_blank" 
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm hover:shadow-md"
                                          >
                                            Start Call
                                          </a>
                                        ) : res.status === 'CONFIRMED' && res.zoomJoinUrl ? (
                                          <span className="text-[10px] font-bold text-gray-400 italic">Ready {Math.round((new Date(res.startTime).getTime() - new Date().getTime()) / 60000)}m</span>
                                        ) : null}
                                        <button 
                                          onClick={() => deleteReservation(res.id)}
                                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                          title="Delete Reservation"
                                        >
                                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Select a Client</h3>
                <p className="text-gray-500 max-w-xs">Pick a client from the list to manage their messages, missions, and reservations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
