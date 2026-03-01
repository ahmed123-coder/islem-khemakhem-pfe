'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'

interface Order {
  id: string
  status: string
  messagesUsed: number
  callMinutesUsed: number
  createdAt: string
  closedAt: string | null
  client: { id: string; name: string | null; email: string }
  consultant: { id: string; name: string } | null
  serviceTier: { id: string; tierType: string; price: string; service: { name: string } }
}

export default function SubscriptionsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [form, setForm] = useState<{ status?: string; messagesUsed?: number; callMinutesUsed?: number }>({})

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editOrder) return
    
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editOrder.id, ...form })
      })
      if (res.ok) {
        setForm({})
        setEditOrder(null)
        fetchOrders()
      }
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return
    
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Subscriptions Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {editOrder && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Edit Subscription</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full p-2 border rounded" value={form.status || editOrder.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="PENDING">PENDING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Messages Used</label>
                <input type="number" className="w-full p-2 border rounded" value={form.messagesUsed ?? editOrder.messagesUsed} onChange={e => setForm({ ...form, messagesUsed: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Call Minutes Used</label>
                <input type="number" className="w-full p-2 border rounded" value={form.callMinutesUsed ?? editOrder.callMinutesUsed} onChange={e => setForm({ ...form, callMinutesUsed: parseInt(e.target.value) })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Update</Button>
                <Button type="button" variant="outline" onClick={() => { setEditOrder(null); setForm({}) }}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        <div className={editOrder ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="space-y-4 max-h-[700px] overflow-y-auto">
            {orders.map(order => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold">{order.serviceTier.service.name} - {order.serviceTier.tierType}</h3>
                      <Badge variant={order.status === 'ACTIVE' ? 'default' : order.status === 'COMPLETED' ? 'secondary' : 'outline'}>{order.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>Client: {order.client.name || order.client.email}</p>
                      <p>Consultant: {order.consultant?.name || 'Not assigned'}</p>
                      <p>Price: ${order.serviceTier.price}</p>
                      <p>Messages: {order.messagesUsed}</p>
                      <p>Call Minutes: {order.callMinutesUsed}</p>
                      <p>Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditOrder(order); setForm({}) }}><Pencil size={16} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteOrder(order.id)}><Trash2 size={16} /></Button>
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
