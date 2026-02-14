'use client'

//ya islem latrabhek nektli 3chti msabeh ll 4 w noss taw haka 

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

type Blog = { id: string; title: string; content: string; excerpt?: string; published: boolean }
type Service = { id: string; title: string; description: string; icon?: string }
type Contact = { id: string; name: string; email: string; message: string; status: string }

export default function AdminPage() {
  const [tab, setTab] = useState<'blogs' | 'services' | 'contacts'>('blogs')
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState<any>({})

  useEffect(() => { loadData() }, [tab])

  const loadData = async () => {
    const res = await fetch(`/api/admin/${tab}`)
    const data = await res.json()
    if (tab === 'blogs') setBlogs(data)
    else if (tab === 'services') setServices(data)
    else setContacts(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    await fetch(`/api/admin/${tab}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setForm({})
    setEditItem(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await fetch(`/api/admin/${tab}?id=${id}`, { method: 'DELETE' })
    loadData()
  }

  const handleEdit = (item: any) => {
    setEditItem(item)
    setForm(item)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setTab('blogs')} variant={tab === 'blogs' ? 'default' : 'outline'}>Blogs</Button>
          <Button onClick={() => setTab('services')} variant={tab === 'services' ? 'default' : 'outline'}>Services</Button>
          <Button onClick={() => setTab('contacts')} variant={tab === 'contacts' ? 'default' : 'outline'}>Contacts</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{editItem ? 'Edit' : 'Create'} {tab.slice(0, -1)}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'blogs' && (
                <>
                  <Input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required />
                  <Textarea placeholder="Content" value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} required />
                  <Input placeholder="Excerpt" value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.published || false} onChange={e => setForm({ ...form, published: e.target.checked })} />
                    Published
                  </label>
                </>
              )}
              {tab === 'services' && (
                <>
                  <Input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required />
                  <Textarea placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} required />
                  <Input placeholder="Icon (optional)" value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} />
                </>
              )}
              {tab === 'contacts' && (
                <p className="text-gray-600">Contacts are read-only. You can only update status or delete.</p>
              )}
              <div className="flex gap-2">
                <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
                {editItem && <Button type="button" variant="outline" onClick={() => { setEditItem(null); setForm({}) }}>Cancel</Button>}
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">All {tab}</h2>
            {tab === 'blogs' && blogs.map(blog => (
              <Card key={blog.id} className="p-4">
                <h3 className="font-bold">{blog.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{blog.content}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleEdit(blog)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(blog.id)}>Delete</Button>
                </div>
              </Card>
            ))}
            {tab === 'services' && services.map(service => (
              <Card key={service.id} className="p-4">
                <h3 className="font-bold">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleEdit(service)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(service.id)}>Delete</Button>
                </div>
              </Card>
            ))}
            {tab === 'contacts' && contacts.map(contact => (
              <Card key={contact.id} className="p-4">
                <h3 className="font-bold">{contact.name}</h3>
                <p className="text-sm">{contact.email}</p>
                <p className="text-sm text-gray-600">{contact.message}</p>
                <p className="text-xs mt-1">Status: {contact.status}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(contact.id)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
