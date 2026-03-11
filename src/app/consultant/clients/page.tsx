'use client'

import { useEffect, useState } from 'react'

export default function ConsultantClients() {
  const [activeTab, setActiveTab] = useState<'clients' | 'messages' | 'missions' | 'calls'>('clients')
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [missions, setMissions] = useState<any[]>([])
  const [calls, setCalls] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      fetchMessages(selectedClient)
      fetchMissions(selectedClient)
      fetchCalls(selectedClient)
    }
  }, [selectedClient])

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
                  </div>

                  <div className="p-6">
                    {activeTab === 'messages' && (
                      <div>
                        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                          {messages.map(msg => (
                            <div key={msg.id} className={`p-3 rounded-lg ${msg.senderType === 'CONSULTANT' ? 'bg-blue-100 ml-12' : 'bg-gray-100 mr-12'}`}>
                              <div className="text-sm font-medium mb-1">{msg.senderType}</div>
                              <div>{msg.content}</div>
                              <div className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 border rounded-lg px-4 py-2"
                          />
                          <button onClick={sendMessage} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            Send
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'missions' && (
                      <div>
                        <button onClick={createMission} className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                          + New Mission
                        </button>
                        <div className="space-y-4">
                          {missions.map(mission => (
                            <div key={mission.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-lg">{mission.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                  mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                  mission.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {mission.status}
                                </span>
                              </div>
                              {mission.description && <p className="text-gray-600 mb-3">{mission.description}</p>}
                              
                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">Tasks ({mission.milestones.length})</h4>
                                  <button 
                                    onClick={() => createMilestone(mission.id)}
                                    className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                                  >
                                    + Add Task
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {mission.milestones.map((milestone: any) => (
                                    <div key={milestone.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                      <input
                                        type="checkbox"
                                        checked={milestone.status === 'COMPLETED'}
                                        onChange={(e) => updateMilestone(milestone.id, e.target.checked ? 'COMPLETED' : 'PENDING')}
                                        className="w-5 h-5"
                                      />
                                      <div className="flex-1">
                                        <div className={milestone.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}>
                                          {milestone.title}
                                        </div>
                                        {milestone.dueDate && (
                                          <div className="text-xs text-gray-500">Due: {new Date(milestone.dueDate).toLocaleDateString()}</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'calls' && (
                      <div>
                        {calls.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">No calls recorded yet</div>
                        ) : (
                          <div className="space-y-4">
                            {calls.map(call => (
                              <div key={call.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{new Date(call.startedAt).toLocaleString()}</div>
                                    <div className="text-sm text-gray-500 text-gray-500">Duration: {call.duration} minutes</div>
                                  </div>
                                  {call.recordingUrl && (
                                    <a href={call.recordingUrl} target="_blank" className="text-blue-600 hover:underline text-sm">
                                      🎧 Recording
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                Select a client to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
