'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { FileText, Briefcase, Mail, Users } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ blogs: 0, services: 0, contacts: 0, subscriptions: 0, missions: 0 })

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(data => {
      setStats({ ...data, missions: data.missions || 0 })
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'Blogs', value: stats.blogs, icon: FileText, color: 'bg-blue-500' },
    { label: 'Services', value: stats.services, icon: Briefcase, color: 'bg-green-500' },
    { label: 'Contacts', value: stats.contacts, icon: Mail, color: 'bg-yellow-500' },
    { label: 'Subscriptions', value: stats.subscriptions, icon: Users, color: 'bg-purple-500' },
    { label: 'Missions', value: stats.missions, icon: Briefcase, color: 'bg-indigo-500' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="p-6">
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
          )
        })}
      </div>
    </div>
  )
}
