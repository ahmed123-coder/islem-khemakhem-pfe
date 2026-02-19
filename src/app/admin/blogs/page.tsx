'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

type Blog = { id: string; title: string; content: string; excerpt?: string; published: boolean }

export default function BlogsAdmin() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [editItem, setEditItem] = useState<Blog | null>(null)
  const [form, setForm] = useState<Partial<Blog>>({})

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await fetch('/api/admin/blogs')
    const data = await res.json()
    setBlogs(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    await fetch('/api/admin/blogs', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setForm({})
    setEditItem(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog?')) return
    await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' })
    loadData()
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Blogs Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{editItem ? 'Edit' : 'Create'} Blog</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <Textarea placeholder="Content" rows={6} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} required />
            <Input placeholder="Excerpt" value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.published || false} onChange={e => setForm({ ...form, published: e.target.checked })} />
              Published
            </label>
            <div className="flex gap-2">
              <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
              {editItem && <Button type="button" variant="outline" onClick={() => { setEditItem(null); setForm({}) }}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Blogs</h2>
          {blogs.map(blog => (
            <Card key={blog.id} className="p-4">
              <h3 className="font-bold">{blog.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{blog.content}</p>
              <p className="text-xs mt-1">{blog.published ? '✓ Published' : '✗ Draft'}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => { setEditItem(blog); setForm(blog) }}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(blog.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
