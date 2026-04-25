'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'

interface Order {
  id: string
  status: string
  paymentMethod: string
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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [methodFilter, setMethodFilter] = useState('ALL')

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.client.name?.toLowerCase().includes(search.toLowerCase()) || 
      order.client.email.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    const matchesMethod = methodFilter === 'ALL' || order.paymentMethod === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setOrders(data)
      } else {
        setOrders([])
      }
    } catch (error) {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      // Find the first invoice associated with this order
      const res = await fetch(`/api/client/invoices`)
      const invoices = await res.json()
      const invoice = invoices.find((inv: any) => inv.orderId === orderId)
      
      if (invoice) {
        window.open(`/api/client/invoices/${invoice.id}/download`, '_blank')
      } else {
        alert('No invoice found for this order.')
      }
    } catch (error) {
      alert('Failed to fetch invoice.')
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
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscriptions Management</h1>
      </div>
      
      {/* Filters Bar */}
      <Card className="p-6 mb-8 border-none shadow-sm rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Recherche</label>
            <input 
              type="text" 
              placeholder="Nom, email ou ID..." 
              className="w-full bg-slate-50 border-none rounded-2xl p-3 text-sm focus:ring-2 ring-blue-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Statut</label>
            <select 
              className="w-full bg-slate-50 border-none rounded-2xl p-3 text-sm focus:ring-2 ring-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Paiement</label>
            <select 
              className="w-full bg-slate-50 border-none rounded-2xl p-3 text-sm focus:ring-2 ring-blue-500"
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
            >
              <option value="ALL">Tous les modes</option>
              <option value="CARD">CARTE</option>
              <option value="VIREMENT">VIREMENT</option>
              <option value="SUR_PLACE">SUR PLACE</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {editOrder && (
          <Card className="p-6 border-none shadow-xl rounded-3xl h-fit sticky top-8">
            <h2 className="text-xl font-bold mb-6">Edition Subscription</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Status</label>
                <select className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm" value={form.status || editOrder.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="PENDING">PENDING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Messages Used</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm" value={form.messagesUsed ?? editOrder.messagesUsed} onChange={e => setForm({ ...form, messagesUsed: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Minutes Used</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm" value={form.callMinutesUsed ?? editOrder.callMinutesUsed} onChange={e => setForm({ ...form, callMinutesUsed: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 rounded-2xl h-12">Mettre à jour</Button>
                <Button type="button" variant="outline" className="rounded-2xl h-12" onClick={() => { setEditOrder(null); setForm({}) }}>Annuler</Button>
              </div>
            </form>
          </Card>
        )}

        <div className={editOrder ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full p-20 text-center text-slate-400 font-bold italic">
                Aucun résultat trouvé pour vos critères.
              </div>
            ) : (
              filteredOrders.map(order => (
                <Card key={order.id} className="p-6 border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] bg-white group relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 tracking-tight">{order.serviceTier.service.name}</h3>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-full">{order.serviceTier.tierType}</Badge>
                      </div>
                      <Badge className={`border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${
                        order.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="rounded-xl h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => { setEditOrder(order); setForm({}) }}><Pencil size={14} /></Button>
                      <Button size="icon" variant="ghost" className="rounded-xl h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteOrder(order.id)}><Trash2 size={14} /></Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[11px] mb-6">
                    <div>
                      <p className="text-slate-400 font-black uppercase tracking-widest mb-1 text-[9px]">Client</p>
                      <p className="font-bold text-slate-700 truncate">{order.client.name || order.client.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-black uppercase tracking-widest mb-1 text-[9px]">Paiement</p>
                      <Badge variant="secondary" className="uppercase text-[9px] font-black rounded-lg">{order.paymentMethod}</Badge>
                    </div>
                    <div>
                      <p className="text-slate-400 font-black uppercase tracking-widest mb-1 text-[9px]">Messages</p>
                      <p className="font-bold text-slate-700">{order.messagesUsed} / {order.serviceTier.maxMessages || '∞'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-black uppercase tracking-widest mb-1 text-[9px]">Minutes</p>
                      <p className="font-bold text-slate-700">{order.callMinutesUsed} / {order.serviceTier.maxCallDuration || '∞'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-50 pt-4 mt-4">
                     <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        onClick={() => handleDownloadInvoice(order.id)}
                     >
                        Facture PDF
                     </Button>
                     <Button 
                        size="sm" 
                        variant="ghost" 
                        className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest"
                        onClick={() => router.push(`/client/solutions?serviceId=${order.serviceTier.service.id}`)}
                     >
                        View Public
                     </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
