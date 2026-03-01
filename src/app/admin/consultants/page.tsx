'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

interface Consultant {
  id: string
  email: string
  name: string
  specialty: string | null
  hourlyRate: string | null
  bio: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [editConsultant, setEditConsultant] = useState<Consultant | null>(null)
  const [form, setForm] = useState<Partial<Consultant & { password?: string }>>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      const res = await fetch('/api/admin/consultants')
      const data = await res.json()
      setConsultants(data)
    } catch (error) {
      console.error('Failed to fetch consultants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editConsultant ? 'PUT' : 'POST'
    const body = editConsultant ? { id: editConsultant.id, ...form } : form
    
    try {
      const res = await fetch('/api/admin/consultants', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setForm({})
        setEditConsultant(null)
        fetchConsultants()
      }
    } catch (error) {
      console.error('Failed to save consultant:', error)
    }
  }

  const deleteConsultant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultant?')) return
    
    try {
      const res = await fetch(`/api/admin/consultants/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setConsultants(consultants.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete consultant:', error)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Consultants Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{editConsultant ? 'Edit' : 'Create'} Consultant</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Email" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} required />
            {!editConsultant && (
              <div className="relative">
                <Input placeholder="Password" type={showPassword ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            <Input placeholder="Specialty" value={form.specialty || ''} onChange={e => setForm({ ...form, specialty: e.target.value })} />
            <Input placeholder="Hourly Rate" type="number" step="0.01" value={form.hourlyRate || ''} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} />
            <Input placeholder="Image URL" value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            <Textarea placeholder="Bio" rows={3} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive ?? true} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <span>Active</span>
            </label>
            <div className="flex gap-2">
              <Button type="submit">{editConsultant ? 'Update' : 'Create'}</Button>
              {editConsultant && <Button type="button" variant="outline" onClick={() => { setEditConsultant(null); setForm({}) }}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Consultants</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {consultants.map(consultant => (
              <Card key={consultant.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{consultant.name}</h3>
                      <Badge variant={consultant.isActive ? 'default' : 'secondary'}>{consultant.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{consultant.email}</p>
                    {consultant.specialty && <p className="text-sm text-gray-600">Specialty: {consultant.specialty}</p>}
                    {consultant.hourlyRate && <p className="text-sm text-gray-600">Rate: ${consultant.hourlyRate}/hr</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditConsultant(consultant); setForm(consultant) }}><Pencil size={16} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteConsultant(consultant.id)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
