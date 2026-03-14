'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Upload, Image as ImageIcon, Plus, Trash2, Edit2, X } from 'lucide-react'

type Service = { id: string; title: string; description: string; icon?: string }
type Tier = { 
  id: string; 
  serviceId: string; 
  tierType: 'BASIC' | 'STANDARD' | 'PREMIUM'; 
  price: number; 
  maxMessages: number | null; 
  maxCallDuration: number | null; 
  canSelectConsultant: boolean; 
  description: string | null;
}

export default function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([])
  const [editItem, setEditItem] = useState<Service | null>(null)
  const [form, setForm] = useState<Partial<Service>>({})
  const [uploading, setUploading] = useState(false)
  
  // Tier management state
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [tiers, setTiers] = useState<Tier[]>([])
  const [editTier, setEditTier] = useState<Tier | null>(null)
  const [tierForm, setTierForm] = useState<Partial<Tier>>({
    tierType: 'BASIC',
    price: 0,
    maxMessages: null,
    maxCallDuration: null,
    canSelectConsultant: false,
    description: ''
  })

  useEffect(() => { loadData() }, [])
  useEffect(() => { 
    if (selectedServiceId) {
      loadTiers(selectedServiceId)
    } else {
      setTiers([])
    }
  }, [selectedServiceId])

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/services')
      if (res.ok) {
        const data = await res.json()
        setServices(Array.isArray(data) ? data : [])
      } else {
        setServices([])
      }
    } catch (e) {
      console.error('Failed to load services', e)
      setServices([])
    }
  }

  const loadTiers = async (serviceId: string) => {
    const res = await fetch(`/api/admin/services/tiers?serviceId=${serviceId}`)
    if (res.ok) {
      const data = await res.json()
      setTiers(data)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('/api/upload/icon', { method: 'POST', body: formData })
      const data = await res.json()
      setForm({ ...form, icon: data.url })
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
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
    if (selectedServiceId === id) setSelectedServiceId(null)
    loadData()
  }

  // Tier operations
  const handleTierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServiceId) return

    const method = editTier ? 'PUT' : 'POST'
    const body = editTier ? { ...tierForm, id: editTier.id } : { ...tierForm, serviceId: selectedServiceId }
    
    const res = await fetch('/api/admin/services/tiers', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (res.ok) {
      setTierForm({
        tierType: 'BASIC',
        price: 0,
        maxMessages: null,
        maxCallDuration: null,
        canSelectConsultant: false,
        description: ''
      })
      setEditTier(null)
      loadTiers(selectedServiceId)
    }
  }

  const handleTierDelete = async (id: string) => {
    if (!confirm('Delete this tier?')) return
    await fetch(`/api/admin/services/tiers?id=${id}`, { method: 'DELETE' })
    if (selectedServiceId) loadTiers(selectedServiceId)
  }

  const selectedService = (Array.isArray(services) ? services : []).find(s => s.id === selectedServiceId)

  return (
    <div className="p-8 pb-24">
      <h1 className="text-3xl font-bold mb-6">Services Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Form and List */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{editItem ? 'Edit' : 'Create'} Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description" rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} required />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Service Icon</label>
                <div className="flex gap-2">
                  <Input placeholder="Icon URL" value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} />
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" disabled={uploading} asChild size="sm">
                      <span>{uploading ? 'Uploading...' : <><Upload size={14} className="mr-2" />Upload</>}</span>
                    </Button>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
                {editItem && <Button type="button" variant="outline" onClick={() => { setEditItem(null); setForm({}) }}>Cancel</Button>}
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">All Services</h2>
            {services.map(service => (
              <Card key={service.id} className={`p-4 transition-all ${selectedServiceId === service.id ? 'ring-2 ring-primary border-primary' : ''}`}>
                <div className="flex gap-3">
                  {service.icon && <img src={service.icon} alt={service.title} className="w-12 h-12 object-cover rounded" />}
                  <div className="flex-1">
                    <h3 className="font-bold">{service.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant={selectedServiceId === service.id ? 'default' : 'outline'} onClick={() => setSelectedServiceId(service.id)}>
                    Manage Tiers
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditItem(service); setForm(service) }}>
                    <Edit2 size={14} className="mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(service.id)}>
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tier Management Section */}
        <div className="space-y-6">
          {selectedServiceId ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Tiers for: <span className="text-primary">{selectedService?.title}</span></h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedServiceId(null)}>
                  <X size={16} className="mr-1" /> Close
                </Button>
              </div>

              <Card className="p-6">
                <h3 className="font-bold mb-4">{editTier ? 'Edit' : 'Add New'} Tier</h3>
                <form onSubmit={handleTierSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={tierForm.tierType}
                        onChange={e => setTierForm({ ...tierForm, tierType: e.target.value as any })}
                      >
                        <option value="BASIC">BASIC</option>
                        <option value="STANDARD">STANDARD</option>
                        <option value="PREMIUM">PREMIUM</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price ($)</label>
                      <Input 
                        type="number" 
                        value={tierForm.price || 0} 
                        onChange={e => setTierForm({ ...tierForm, price: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Messages (empty for unlimited)</label>
                      <Input 
                        type="number" 
                        value={tierForm.maxMessages || ''} 
                        onChange={e => setTierForm({ ...tierForm, maxMessages: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Call Duration (min)</label>
                      <Input 
                        type="number" 
                        value={tierForm.maxCallDuration || ''} 
                        onChange={e => setTierForm({ ...tierForm, maxCallDuration: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="canSelect"
                      checked={tierForm.canSelectConsultant}
                      onChange={e => setTierForm({ ...tierForm, canSelectConsultant: e.target.checked })}
                    />
                    <label htmlFor="canSelect" className="text-sm font-medium cursor-pointer">Can select consultant</label>
                  </div>

                  <Textarea 
                    placeholder="Tier Description" 
                    rows={2} 
                    value={tierForm.description || ''} 
                    onChange={e => setTierForm({ ...tierForm, description: e.target.value })}
                  />

                  <div className="flex gap-2">
                    <Button type="submit">{editTier ? 'Update Tier' : 'Add Tier'}</Button>
                    {editTier && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditTier(null)
                        setTierForm({ tierType: 'BASIC', price: 0, maxMessages: null, maxCallDuration: null, canSelectConsultant: false, description: '' })
                      }}>Cancel</Button>
                    )}
                  </div>
                </form>
              </Card>

              <div className="space-y-3">
                {tiers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed">No tiers configured for this service.</p>
                ) : (
                  tiers.map(tier => (
                    <Card key={tier.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            tier.tierType === 'PREMIUM' ? 'bg-purple-100 text-purple-700' : 
                            tier.tierType === 'STANDARD' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {tier.tierType}
                          </span>
                          <span className="ml-2 font-bold">${tier.price}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditTier(tier); setTierForm(tier) }}>
                            <Edit2 size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleTierDelete(tier.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 grid grid-cols-2 gap-y-1">
                        <div>Messages: {tier.maxMessages ?? 'Unlimited'}</div>
                        <div>Calls: {tier.maxCallDuration ? `${tier.maxCallDuration} min` : 'None/Unlimited'}</div>
                        <div className="col-span-2">Consultant Choice: {tier.canSelectConsultant ? 'Enabled' : 'Disabled'}</div>
                      </div>
                      {tier.description && <p className="text-xs mt-2 text-gray-500 italic">{tier.description}</p>}
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl bg-gray-50 text-gray-400">
              <Plus size={48} className="mb-2 opacity-20" />
              <p>Select a service to manage its tiers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
