'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState<Partial<User & { password?: string }>>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editUser ? 'PUT' : 'POST'
    const body = editUser ? { id: editUser.id, ...form } : form
    
    try {
      const res = await fetch('/api/admin/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setForm({})
        setEditUser(null)
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{editUser ? 'Edit' : 'Create'} User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Email" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input placeholder="Phone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
            {!editUser && (
              <div className="relative">
                <Input placeholder="Password" type={showPassword ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            <select className="w-full p-2 border rounded" value={form.role || 'CLIENT'} onChange={e => setForm({ ...form, role: e.target.value })} required>
              <option value="CLIENT">CLIENT</option>
              <option value="CONSULTANT">CONSULTANT</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit">{editUser ? 'Update' : 'Create'}</Button>
              {editUser && <Button type="button" variant="outline" onClick={() => { setEditUser(null); setForm({}) }}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Users</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {users.map(user => (
              <Card key={user.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{user.name || 'N/A'}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
                    <Badge className="mt-1" variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditUser(user); setForm(user) }}><Pencil size={16} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)} disabled={user.role === 'ADMIN'}><Trash2 size={16} /></Button>
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
