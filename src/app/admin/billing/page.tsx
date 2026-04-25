'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Download, Search, Filter, ReceiptText } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [editInvoice, setEditInvoice] = useState<any>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/admin/billing')
      const data = await res.json()
      setInvoices(data)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string, updates: any) => {
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      if (res.ok) {
        toast.success('Invoice updated')
        setEditInvoice(null)
        fetchInvoices()
      }
    } catch (error) {
      toast.error('Update failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminer cette facture ?')) return
    try {
      const res = await fetch(`/api/admin/billing?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Deleted')
        setInvoices(invoices.filter(i => i.id !== id))
      }
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
        inv.client.name?.toLowerCase().includes(search.toLowerCase()) || 
        inv.client.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) return <div className="p-8">Chargement...</div>

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Factures</h1>
          <p className="text-slate-500 font-medium italic text-sm">Contrôle complet du flux financier expert.</p>
        </div>
        <Button className="bg-slate-900 rounded-2xl h-12 px-8 flex items-center gap-2">
            <ReceiptText className="w-4 h-4" /> Nouvelle Facture
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-2 p-4 border-none shadow-sm rounded-2xl flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par N° Facture, Client..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Card>
        <Card className="p-4 border-none shadow-sm rounded-2xl flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PAID">PAYÉ</option>
            <option value="PENDING">EN ATTENTE</option>
            <option value="UNPAID">NON PAYÉ</option>
          </select>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredInvoices.map(inv => (
          <Card key={inv.id} className="p-6 border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                  {inv.invoiceNumber.split('-').pop()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight">{inv.invoiceNumber}</h3>
                  <p className="text-xs font-bold text-slate-400">{inv.client.name || inv.client.email} · {new Date(inv.issueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant</p>
                  <p className="font-black text-slate-900 text-xl">{inv.amount} €</p>
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Echéance</p>
                  <p className={`text-xs font-bold ${new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' ? 'text-red-500' : 'text-slate-600'}`}>
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <Badge className={`px-3 py-1 rounded-full text-[10px] font-black border-none uppercase tracking-widest ${
                  inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {inv.status}
                </Badge>

                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(`/api/client/invoices/${inv.id}/download`, '_blank')}
                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setEditInvoice(inv)}
                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(inv.id)}
                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {editInvoice?.id === inv.id && (
              <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Statut</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm"
                    defaultValue={inv.status}
                    onChange={(e) => handleUpdate(inv.id, { status: e.target.value })}
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNPAID">UNPAID</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Nouvelle Echéance</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm"
                    onChange={(e) => handleUpdate(inv.id, { dueDate: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                   <Button variant="outline" className="w-full rounded-xl" onClick={() => setEditInvoice(null)}>Fermer</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
