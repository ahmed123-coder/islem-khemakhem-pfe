'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Briefcase } from 'lucide-react'

interface Client {
  id: string
  name: string | null
  email: string
  missionCount: number
  activeMissions: number
}

export default function ConsultantClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/consultant/clients')
      .then(r => r.json())
      .then(data => setClients(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Clients</h1>
        <p className="text-gray-600 mt-2">Manage your client relationships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <Card key={client.id} className="p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <Badge variant={client.activeMissions > 0 ? 'default' : 'secondary'}>
                {client.activeMissions > 0 ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {client.name || 'Client'}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Mail size={16} />
              <span>{client.email}</span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase size={16} />
                  <span>Total Missions</span>
                </div>
                <span className="font-semibold text-gray-900">{client.missionCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold text-blue-600">{client.activeMissions}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No clients yet</p>
        </div>
      )}
    </div>
  )
}
