'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye, EyeOff, UserCheck, UserX } from 'lucide-react'

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
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState<Partial<User & { password?: string }>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
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
    if (!confirm('Supprimer cet utilisateur ?')) return
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

  const filtered = users.filter(u =>
    [u.name, u.email, u.phone, u.role].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="p-8">Chargement...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        <span className="text-sm text-gray-500">{users.length} utilisateur(s)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4">{editUser ? 'Modifier' : 'Créer'} un utilisateur</h2>
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
            <select className="w-full p-2 border rounded" value={form.role || 'CLIENT'} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="CLIENT">CLIENT</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit">{editUser ? 'Mettre à jour' : 'Créer'}</Button>
              {editUser && <Button type="button" variant="outline" onClick={() => { setEditUser(null); setForm({}) }}>Annuler</Button>}
            </div>
          </form>
        </Card>

        {/* Users list */}
        <div className="lg:col-span-2 space-y-4">
          <Input placeholder="Rechercher par nom, email, téléphone, rôle..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filtered.map(user => (
              <Card key={user.id} className={`p-4 border-l-4 ${user.isActive ? 'border-l-green-500' : 'border-l-red-400'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{user.name || 'Sans nom'}</h3>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
                      <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.phone && <p className="text-sm text-gray-500">📞 {user.phone}</p>}
                    <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                      <span>Commandes: <strong>{user._count.orders}</strong></span>
                      <span>Réservations: <strong>{user._count.reservations}</strong></span>
                      <span>Inscrit le: <strong>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</strong></span>
                      <span>Mis à jour: <strong>{new Date(user.updatedAt).toLocaleDateString('fr-FR')}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" title={user.isActive ? 'Désactiver' : 'Activer'} onClick={() => toggleActive(user)}>
                      {user.isActive ? <UserX size={16} className="text-red-500" /> : <UserCheck size={16} className="text-green-500" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditUser(user); setForm(user) }}><Pencil size={16} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)} disabled={user.role === 'ADMIN'}><Trash2 size={16} /></Button>
                  </div>
                </div>
              </Card>
            ))}
            {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Aucun utilisateur trouvé</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
