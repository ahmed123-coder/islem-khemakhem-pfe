'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye, EyeOff, UserCheck, UserX, ShoppingCart, X, AlertTriangle } from 'lucide-react'

interface OrderSummary {
  id: string
  status: string
  createdAt: string
  serviceTier: {
    tierType: string
    price: number
    service: { name: string }
  }
}

interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { orders: number; reservations: number }
  orders: OrderSummary[]
}

interface Service {
  id: string
  name: string
}

interface Tier {
  id: string
  tierType: string
  price: number
  description: string | null
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-500',
}

const COMPLETED_ORDER_THRESHOLD = 3

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState<Partial<User & { password?: string }>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [search, setSearch] = useState('')

  // Order modal
  const [orderTarget, setOrderTarget] = useState<User | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [tiers, setTiers] = useState<Tier[]>([])
  const [selectedTier, setSelectedTier] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.filter((u: User) => u.role === 'CLIENT'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editUser ? 'PUT' : 'POST'
    const body = editUser ? { id: editUser.id, ...form } : form
    const res = await fetch('/api/admin/users', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) { setForm({}); setEditUser(null); fetchUsers() }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) setUsers(users.filter(u => u.id !== id))
  }

  const toggleActive = async (user: User) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, isActive: !user.isActive })
    })
    if (res.ok) fetchUsers()
  }

  const openOrderModal = async (user: User) => {
    setOrderTarget(user)
    setSelectedService('')
    setSelectedTier('')
    setTiers([])
    const res = await fetch('/api/admin/services')
    if (res.ok) setServices(await res.json())
  }

  const handleServiceChange = async (serviceId: string) => {
    setSelectedService(serviceId)
    setSelectedTier('')
    if (!serviceId) return setTiers([])
    const res = await fetch(`/api/admin/services/tiers?serviceId=${serviceId}`)
    if (res.ok) setTiers(await res.json())
  }

  const handleCreateOrder = async () => {
    if (!orderTarget || !selectedTier) return
    setOrderLoading(true)
    const res = await fetch('/api/admin/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: orderTarget.id, serviceTierId: selectedTier })
    })
    setOrderLoading(false)
    if (res.ok) {
      setOrderTarget(null)
      fetchUsers()
    }
  }

  const filtered = users.filter(u =>
    [u.name, u.email, u.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const completedCount = (u: User) => u.orders.filter(o => o.status === 'COMPLETED').length
  const activeOrders = (u: User) => u.orders.filter(o => o.status === 'ACTIVE' || o.status === 'PENDING')
  const pastOrders = (u: User) => u.orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED')
  const isHighValue = (u: User) => completedCount(u) >= COMPLETED_ORDER_THRESHOLD

  if (loading) return <div className="p-8">Chargement...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <span className="text-sm text-gray-500">{users.length} client(s)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4">{editUser ? 'Modifier' : 'Créer'} un client</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Nom" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Email" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input placeholder="Téléphone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
            {!editUser && (
              <div className="relative">
                <Input placeholder="Mot de passe" type={showPassword ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit">{editUser ? 'Mettre à jour' : 'Créer'}</Button>
              {editUser && <Button type="button" variant="outline" onClick={() => { setEditUser(null); setForm({}) }}>Annuler</Button>}
            </div>
          </form>
        </Card>

        {/* Clients list */}
        <div className="lg:col-span-2 space-y-4">
          <Input placeholder="Rechercher par nom, email, téléphone..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {filtered.map(user => (
              <Card key={user.id} className={`p-4 border-l-4 ${user.isActive ? 'border-l-green-500' : 'border-l-red-400'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{user.name || 'Sans nom'}</h3>
                      <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                      {isHighValue(user) && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full" title={`${completedCount(user)} commandes complétées — client fidèle à relancer`}>
                          <AlertTriangle size={12} /> {completedCount(user)} complétées
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.phone && <p className="text-sm text-gray-500">📞 {user.phone}</p>}

                    {/* Active orders */}
                    {activeOrders(user).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Commandes actives</p>
                        {activeOrders(user).map(o => (
                          <div key={o.id} className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                            <span className="text-gray-700">{o.serviceTier.service.name} — <span className="font-medium">{o.serviceTier.tierType}</span></span>
                            <span className="text-gray-400">{Number(o.serviceTier.price).toFixed(0)} DT</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Past orders */}
                    {pastOrders(user).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Historique</p>
                        {pastOrders(user).map(o => (
                          <div key={o.id} className="flex items-center gap-2 text-xs opacity-70">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                            <span className="text-gray-600">{o.serviceTier.service.name} — {o.serviceTier.tierType}</span>
                            <span className="text-gray-400">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {user.orders.length === 0 && (
                      <p className="text-xs text-gray-400 italic">Aucune commande</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" variant="outline" title="Créer une commande" onClick={() => openOrderModal(user)}>
                      <ShoppingCart size={16} className="text-blue-500" />
                    </Button>
                    <Button size="sm" variant="outline" title={user.isActive ? 'Désactiver' : 'Activer'} onClick={() => toggleActive(user)}>
                      {user.isActive ? <UserX size={16} className="text-red-500" /> : <UserCheck size={16} className="text-green-500" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditUser(user); setForm(user) }}><Pencil size={16} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              </Card>
            ))}
            {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Aucun client trouvé</p>}
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {orderTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Nouvelle commande pour <span className="text-blue-600">{orderTarget.name || orderTarget.email}</span></h2>
              <button onClick={() => setOrderTarget(null)}><X size={20} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Service</label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  value={selectedService}
                  onChange={e => handleServiceChange(e.target.value)}
                >
                  <option value="">-- Choisir un service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {tiers.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tier</label>
                  <div className="space-y-2">
                    {tiers.map(t => (
                      <label key={t.id} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${selectedTier === t.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <input type="radio" name="tier" value={t.id} checked={selectedTier === t.id} onChange={() => setSelectedTier(t.id)} />
                        <div className="flex-1">
                          <span className="font-medium text-sm">{t.tierType}</span>
                          {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                        </div>
                        <span className="text-sm font-bold text-blue-600">{Number(t.price).toFixed(0)} DT</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateOrder} disabled={!selectedTier || orderLoading} className="flex-1">
                {orderLoading ? 'Création...' : 'Créer la commande'}
              </Button>
              <Button variant="outline" onClick={() => setOrderTarget(null)}>Annuler</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
