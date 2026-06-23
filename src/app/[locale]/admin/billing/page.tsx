'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Download, Search, Filter, ReceiptText } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AdminBillingPage() {
  const t = useTranslations("adminPage.billing")
  const commonT = useTranslations("common")
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [editInvoice, setEditInvoice] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    amount: '',
    dueDate: '',
    status: 'PENDING',
    orderId: ''
  })

  useEffect(() => {
    fetchInvoices()
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const result = await res.json()
      const data = result.data || result || []
      setClients(data.filter((u: any) => u.role === 'CLIENT' || u.role === 'ADMIN'))
    } catch (error) {
      console.error('Failed to fetch clients')
    }
  }

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/admin/billing')
      const result = await res.json()
      const data = result.data || result || []
      setInvoices(data)
    } catch (error) {
        console.error('Failed to fetch invoices')
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
        toast.success(t('messages.invoiceUpdated'))
        setEditInvoice(null)
        fetchInvoices()
      }
    } catch (error) {
      toast.error(t('messages.updateFailed'))
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInvoice.clientId || !newInvoice.amount || !newInvoice.dueDate) {
      toast.error(t('messages.requiredFields'))
      return
    }

    try {
      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      })
      if (res.ok) {
        toast.success(t('messages.invoiceCreated'))
        setShowCreateModal(false)
        setNewInvoice({ clientId: '', amount: '', dueDate: '', status: 'PENDING', orderId: '' })
        fetchInvoices()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error(t('messages.networkError'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return
    try {
      const res = await fetch(`/api/admin/billing?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(t('messages.deleted'))
        setInvoices(invoices.filter(i => i.id !== id))
      }
    } catch (error) {
      toast.error(t('messages.deleteFailed'))
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

  if (loading) return <div className="p-8">{commonT("loading")}</div>

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("title")}</h1>
          <p className="text-slate-500 font-medium italic text-sm">{t("description")}</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-slate-900 rounded-2xl h-12 px-8 flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
        >
            <ReceiptText className="w-4 h-4" /> {t("createNew")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-2 p-4 border-none shadow-sm rounded-2xl flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder={t("search")} 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Card>
        <Card className="p-4 border-none shadow-sm rounded-2xl flex items-center gap-3 bg-white">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">{t("allStatuses")}</option>
            <option value="PAID">{t("status.paid")}</option>
            <option value="PENDING">{t("status.pending")}</option>
            <option value="UNPAID">{t("status.unpaid")}</option>
          </select>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredInvoices.map(inv => (
          <Card key={inv.id} className="p-6 border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                  {inv.invoiceNumber.split('-').pop().slice(-2)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight text-lg">{inv.invoiceNumber}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{inv.client.name || inv.client.email} · {new Date(inv.issueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("columns.amount")}</p>
                  <p className="font-black text-slate-900 text-2xl">{inv.amount} DT</p>
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("columns.dueDate")}</p>
                  <p className={`text-xs font-bold ${new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' ? 'text-red-500' : 'text-slate-600'}`}>
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black border-none uppercase tracking-widest shadow-sm ${
                  inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 
                  inv.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                }`}>
                  {inv.status}
                </Badge>

                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(`/api/client/invoices/${inv.id}/download`, '_blank')}
                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
                    title={t('download')}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setEditInvoice(inv)}
                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
                    title={t('edit')}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(inv.id)}
                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {editInvoice?.id === inv.id && (
              <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">{t('columns.status')}</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
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
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">{t('newDueDate')}</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                    onChange={(e) => handleUpdate(inv.id, { dueDate: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                   <Button variant="outline" className="w-full rounded-xl h-12 font-bold" onClick={() => setEditInvoice(null)}>{commonT('close')}</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl border-none bg-white animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="flex justify-between items-center mb-8 relative">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t("createNew")}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t("form.subtitle")}</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6 relative">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 px-1">{t("form.client")}</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={newInvoice.clientId}
                  onChange={e => setNewInvoice({...newInvoice, clientId: e.target.value})}
                  required
                >
                  <option value="">{t("form.selectClient")}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name || c.email} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 px-1">{t("columns.amount")} ({t("currency")})</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="0.00"
                    value={newInvoice.amount}
                    onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 px-1">{t("columns.dueDate")}</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={newInvoice.dueDate}
                    onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 px-1">{t('initialStatus')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['PENDING', 'UNPAID', 'PAID'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewInvoice({...newInvoice, status: s})}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${
                        newInvoice.status === s 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 rounded-2xl h-14 font-bold text-slate-600 border-slate-200"
                  onClick={() => setShowCreateModal(false)}
                >
                  {commonT("cancel")}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 font-black text-white shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  {t("form.generate")}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
