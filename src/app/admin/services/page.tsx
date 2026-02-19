'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

type Service = { id: string; title: string; description: string; icon?: string }

export default function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([])
  const [editItem, setEditItem] = useState<Service | null>(null)
  const [form, setForm] = useState<Partial<Service>>({})

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await fetch('/api/admin/services')
    const data = await res.json()
    setServices(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    await fetch('/api/admin/services', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setForm({})
    setEditItem(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' })
    loadData()
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Services Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{editItem ? 'Edit' : 'Create'} Service</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <Textarea placeholder="Description" rows={4} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} required />
            <Input placeholder="Icon (optional)" value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} />
            <div className="flex gap-2">
              <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
              {editItem && <Button type="button" variant="outline" onClick={() => { setEditItem(null); setForm({}) }}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Services</h2>
          {services.map(service => (
            <Card key={service.id} className="p-4">
              <h3 className="font-bold">{service.title}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => { setEditItem(service); setForm(service) }}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(service.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
