'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Calendar, User, Settings, Clock } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  name: string
  email: string
}

export default function ConsultantDashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setUser(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  const mainCards = [
    { label: 'My Appointments', value: 0, icon: Calendar, color: 'bg-blue-500', href: '/consultant/appointments' },
    { label: 'Hours This Month', value: 0, icon: Clock, color: 'bg-green-500', href: '/consultant/appointments' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Consultant Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'Consultant'}!</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainCards.map(card => {
            const Icon = card.icon
            return (
              <Link key={card.label} href={card.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{card.label}</p>
                      <p className="text-3xl font-bold mt-2">{card.value}</p>
                    </div>
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/consultant/settings" className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition">
            <div className="flex items-center gap-3">
              <User className="text-blue-500" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Profile</h3>
                <p className="text-sm text-gray-600 mt-1">Manage your account</p>
              </div>
            </div>
          </Link>
          <Link href="/consultant/settings" className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition">
            <div className="flex items-center gap-3">
              <Settings className="text-purple-500" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Update your preferences</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
