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
  client: { name: string; email: string }
  consultant: { name: string; email: string }
  createdAt: string
}

export default function MissionsAdmin() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [editItem, setEditItem] = useState<Mission | null>(null)
  const [form, setForm] = useState<any>({})

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await fetch('/api/missions')
    const data = await res.json()
    setMissions(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = 'PUT'
    await fetch('/api/missions', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editItem?.id, ...form })
    })
    setForm({})
    setEditItem(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this mission?')) return
    await fetch(`/api/missions?id=${id}`, { method: 'DELETE' })
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Missions Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {editItem && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Edit Mission</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Title"
                value={form.title || ''}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                rows={3}
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <select
                value={form.status || ''}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <div>
                <label className="block text-sm font-medium mb-2">Progress: {form.progress || 0}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.progress || 0}
                  onChange={e => setForm({ ...form, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Update</Button>
                <Button type="button" variant="outline" onClick={() => { setEditItem(null); setForm({}) }}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        <div className={editItem ? '' : 'lg:col-span-2'}>
          <div className="space-y-4">
            <h2 className="text-xl font-bold">All Missions</h2>
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

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <p className="font-medium">{mission.client.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Consultant:</span>
                    <p className="font-medium">{mission.consultant.name}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setEditItem(mission); setForm(mission) }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(mission.id)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
