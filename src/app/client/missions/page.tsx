'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Briefcase, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Mission {
  id: string
  title: string
  description: string | null
  status: string
  progress: number
  consultant: { name: string; specialty: string | null }
  createdAt: string
}

export default function ClientMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/missions')
      .then(r => r.json())
      .then(data => setMissions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const filteredMissions = missions.filter(m => 
    filter === 'ALL' || m.status === filter
  )

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <Clock className="text-orange-500" size={20} />
      case 'COMPLETED': return <CheckCircle className="text-green-500" size={20} />
      case 'PENDING': return <AlertCircle className="text-yellow-500" size={20} />
      default: return <Briefcase className="text-gray-500" size={20} />
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Missions</h1>
        <p className="text-gray-600 mt-2">Track your consulting missions and progress</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMissions.map(mission => (
          <Link key={mission.id} href={`/missions/${mission.id}`}>
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(mission.status)}
                    <h3 className="text-xl font-semibold text-gray-900">{mission.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-3">{mission.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Consultant: {mission.consultant.name}</span>
                    <span>•</span>
                    <span>{mission.consultant.specialty}</span>
                    <span>•</span>
                    <span>Started: {new Date(mission.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <Badge variant={
                    mission.status === 'ACTIVE' ? 'default' :
                    mission.status === 'COMPLETED' ? 'secondary' : 'outline'
                  }>
                    {mission.status}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">{mission.progress}% Complete</p>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all" 
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredMissions.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No missions found</p>
        </div>
      )}
    </div>
  )
}
