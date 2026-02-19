'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type Subscription = { id: string; userId: string; packageId: string; status: string; billingCycle: string; startDate: string; endDate: string; user?: { name: string; email: string } }

export default function SubscriptionsAdmin() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await fetch('/api/admin/subscriptions')
    const data = await res.json()
    setSubscriptions(data)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/subscriptions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subscription?')) return
    await fetch(`/api/admin/subscriptions?id=${id}`, { method: 'DELETE' })
    loadData()
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Subscriptions Management</h1>
      
      <div className="space-y-4 max-w-5xl">
        {subscriptions.map(sub => (
          <Card key={sub.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{sub.user?.name || 'User'}</h3>
                <p className="text-sm text-gray-600">{sub.user?.email}</p>
              </div>
              <select
                value={sub.status}
                onChange={e => updateStatus(sub.id, e.target.value)}
                className="px-3 py-1 border rounded"
              >
                <option value="ACTIVE">Active</option>
                <option value="PAST_DUE">Past Due</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-600">Billing:</span> {sub.billingCycle}
              </div>
              <div>
                <span className="text-gray-600">Start:</span> {new Date(sub.startDate).toLocaleDateString()}
              </div>
              <div>
                <span className="text-gray-600">End:</span> {new Date(sub.endDate).toLocaleDateString()}
              </div>
            </div>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(sub.id)}>Delete</Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
