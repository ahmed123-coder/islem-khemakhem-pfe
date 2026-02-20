'use client'

import { useEffect, useState } from 'react'
import { Briefcase, Users, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalMissions: number
  activeMissions: number
  completedMissions: number
  totalClients: number
}

interface Mission {
  id: string
  title: string
  status: string
  progress: number
  client: { name: string | null }
}

export default function ConsultantDashboard() {
  const [stats, setStats] = useState<Stats>({ totalMissions: 0, activeMissions: 0, completedMissions: 0, totalClients: 0 })
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/consultant/stats').then(r => r.json()),
      fetch('/api/consultant/missions').then(r => r.json())
    ]).then(([statsData, missionsData]) => {
      setStats(statsData)
      setMissions(missionsData.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Consultant Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your missions and clients</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Missions</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalMissions}</p>
            </div>
            <Briefcase className="text-blue-500" size={40} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Missions</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeMissions}</p>
            </div>
            <Clock className="text-orange-500" size={40} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completedMissions}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Clients</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalClients}</p>
            </div>
            <Users className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Missions</h2>
          <Link href="/consultant/missions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {missions.map((mission) => (
            <Link key={mission.id} href={`/missions/${mission.id}`}>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{mission.title}</h3>
                  <p className="text-sm text-gray-500">{mission.client.name || 'Client'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{mission.progress}% Complete</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mission.progress}%` }} />
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    mission.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                    mission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {mission.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {missions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No missions assigned yet
          </div>
        )}
      </div>
    </div>
  )
}
