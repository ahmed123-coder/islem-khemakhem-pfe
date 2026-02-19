'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

type Plan = { id: string; name: string; nameAr?: string; planType: string; description?: string; active: boolean }

export default function SubscriptionPlansAdmin() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [editItem, setEditItem] = useState<Plan | null>(null)
  const [form, setForm] = useState<Partial<Plan>>({})

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await fetch('/api/admin/subscription-plans')
    const data = await res.json()
    setPlans(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    await fetch('/api/admin/subscription-plans', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setForm({})
    setEditItem(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plan?')) return
    await fetch(`/api/admin/subscription-plans?id=${id}`, { method: 'DELETE' })
    loadData()
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{editItem ? 'Edit' : 'Create'} Plan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Name (Arabic)" value={form.nameAr || ''} onChange={e => setForm({ ...form, nameAr: e.target.value })} />
            <select value={form.planType || ''} onChange={e => setForm({ ...form, planType: e.target.value })} className="w-full px-3 py-2 border rounded" required>
              <option value="">Select Type</option>
              <option value="ESSENTIAL">Essential</option>
              <option value="PRO">Pro</option>
              <option value="PREMIUM">Premium</option>
            </select>
            <Textarea placeholder="Description" rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.active ?? true} onChange={e => setForm({ ...form, active: e.target.checked })} />
              Active
            </label>
            <div className="flex gap-2">
              <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
              {editItem && <Button type="button" variant="outline" onClick={() => { setEditItem(null); setForm({}) }}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Plans</h2>
          {plans.map(plan => (
            <Card key={plan.id} className="p-4">
              <h3 className="font-bold">{plan.name}</h3>
              <p className="text-sm text-gray-600">{plan.planType}</p>
              <p className="text-xs mt-1">{plan.active ? '✓ Active' : '✗ Inactive'}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => { setEditItem(plan); setForm(plan) }}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(plan.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
