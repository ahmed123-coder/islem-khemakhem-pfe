'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MessageSquare, Briefcase } from 'lucide-react'

interface Mission {
  id: string
  title: string
  status: string
  messageCount: number
  consultant: { name: string }
}

export default function ClientMessagesPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/missions')
      .then(r => r.json())
      .then(data => setMissions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Communicate with your consultants</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {missions.map(mission => (
          <Link key={mission.id} href={`/missions/${mission.id}`}>
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
                    <p className="text-sm text-gray-600">Consultant: {mission.consultant.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{mission.messageCount} messages</p>
                    <Badge variant={mission.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {mission.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {missions.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No messages yet</p>
        </div>
      )}
    </div>
  )
}
