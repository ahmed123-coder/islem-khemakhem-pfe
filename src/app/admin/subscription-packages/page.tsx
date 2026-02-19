'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

type Package = { id: string; planId: string; priceMonthly: number; priceYearly: number; currency: string; features: string[]; maxMessages?: number; maxMissions?: number; hasDiagnostic: boolean }
type Plan = { id: string; name: string }

export default function SubscriptionPackagesAdmin() {
  const [packages, setPackages] = useState<Package[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [editItem, setEditItem] = useState<Package | null>(null)
  const [form, setForm] = useState<Partial<Package>>({})

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [pkgRes, planRes] = await Promise.all([
      fetch('/api/admin/subscription-packages'),
      fetch('/api/admin/subscription-plans')
    ])
    setPackages(await pkgRes.json())
    setPlans(await planRes.json())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    await fetch('/api/admin/subscription-packages', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setForm({})
    setEditItem(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return
    await fetch(`/api/admin/subscription-packages?id=${id}`, { method: 'DELETE' })
    loadData()
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Packages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{editItem ? 'Edit' : 'Create'} Package</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select value={form.planId || ''} onChange={e => setForm({ ...form, planId: e.target.value })} className="w-full px-3 py-2 border rounded" required>
              <option value="">Select Plan</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Input type="number" step="0.001" placeholder="Monthly Price" value={form.priceMonthly || ''} onChange={e => setForm({ ...form, priceMonthly: parseFloat(e.target.value) })} required />
            <Input type="number" step="0.001" placeholder="Yearly Price" value={form.priceYearly || ''} onChange={e => setForm({ ...form, priceYearly: parseFloat(e.target.value) })} required />
            <Input placeholder="Currency" value={form.currency || 'TND'} onChange={e => setForm({ ...form, currency: e.target.value })} />
            <Textarea placeholder="Features (JSON array)" rows={4} value={JSON.stringify(form.features || [], null, 2)} onChange={e => { try { setForm({ ...form, features: JSON.parse(e.target.value) }) } catch {} }} />
            <Input type="number" placeholder="Max Messages" value={form.maxMessages || ''} onChange={e => setForm({ ...form, maxMessages: parseInt(e.target.value) || undefined })} />
            <Input type="number" placeholder="Max Missions" value={form.maxMissions || ''} onChange={e => setForm({ ...form, maxMissions: parseInt(e.target.value) || undefined })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.hasDiagnostic ?? true} onChange={e => setForm({ ...form, hasDiagnostic: e.target.checked })} />
              Has Diagnostic
            </label>
            <div className="flex gap-2">
              <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
              {editItem && <Button type="button" variant="outline" onClick={() => { setEditItem(null); setForm({}) }}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Packages</h2>
          {packages.map(pkg => (
            <Card key={pkg.id} className="p-4">
              <h3 className="font-bold">{plans.find(p => p.id === pkg.planId)?.name}</h3>
              <p className="text-sm text-gray-600">{pkg.priceMonthly} {pkg.currency}/mo - {pkg.priceYearly} {pkg.currency}/yr</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => { setEditItem(pkg); setForm(pkg) }}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(pkg.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
