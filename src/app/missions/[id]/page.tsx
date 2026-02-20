'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import MissionDocuments from '@/components/MissionDocuments'

type Mission = {
  id: string
  title: string
  description?: string
  status: string
  progress: number
  client: { name: string; email: string }
  consultant: { name: string; email: string }
  createdAt: string
}

export default function MissionDetailPage() {
  const params = useParams()
  const missionId = params.id as string
  const [mission, setMission] = useState<Mission | null>(null)

  useEffect(() => {
    loadMission()
  }, [missionId])

  const loadMission = async () => {
    const res = await fetch(`/api/missions?id=${missionId}`)
    if (res.ok) {
      const data = await res.json()
      setMission(data)
    }
  }

  if (!mission) {
    return <div className="p-8">Loading...</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACTIVE': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{mission.title}</h1>
              <p className="text-gray-600 mt-2">{mission.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
              {mission.status}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{mission.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${mission.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Client:</span>
              <p className="font-medium">{mission.client.name}</p>
              <p className="text-xs text-gray-500">{mission.client.email}</p>
            </div>
            <div>
              <span className="text-gray-600">Consultant:</span>
              <p className="font-medium">{mission.consultant.name}</p>
              <p className="text-xs text-gray-500">{mission.consultant.email}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <MissionDocuments missionId={missionId} />
        </Card>
      </div>
    </div>
  )
}
