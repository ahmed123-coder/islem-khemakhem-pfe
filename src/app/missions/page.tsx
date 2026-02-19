'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

type Mission = {
  id: string
  title: string
  description?: string
  status: string
  progress: number
  consultant: { name: string }
  createdAt: string
}

export default function ClientMissions() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', consultantId: '', subscriptionId: '' })
  const [consultants, setConsultants] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [missionsRes, consultantsRes, subsRes] = await Promise.all([
      fetch('/api/missions'),
      fetch('/api/consultants'),
      fetch('/api/subscriptions')
    ])
    setMissions(await missionsRes.json())
    setConsultants(await consultantsRes.json())
    setSubscriptions(await subsRes.json())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ title: '', description: '', consultantId: '', subscriptionId: '' })
    setShowForm(false)
    loadData()
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Missions</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Mission'}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Mission</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Mission Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
              <Textarea
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <select
                value={form.consultantId}
                onChange={e => setForm({ ...form, consultantId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select Consultant</option>
                {consultants.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.specialty}</option>
                ))}
              </select>
              <select
                value={form.subscriptionId}
                onChange={e => setForm({ ...form, subscriptionId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select Subscription</option>
                {subscriptions.filter(s => s.status === 'ACTIVE').map(s => (
                  <option key={s.id} value={s.id}>
                    {s.subscription_packages?.subscription_plans?.name} - {s.status}
                  </option>
                ))}
              </select>
              <Button type="submit">Create Mission</Button>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {missions.map(mission => (
            <Card key={mission.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{mission.title}</h3>
                  <p className="text-sm text-gray-600">{mission.description}</p>
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

              <div className="text-sm">
                <span className="text-gray-600">Consultant:</span>
                <span className="font-medium ml-2">{mission.consultant.name}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
