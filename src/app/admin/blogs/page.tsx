'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Upload, Image as ImageIcon } from 'lucide-react'

type Blog = { id: string; title: string; content: string; excerpt?: string; icon?: string; image?: string; published: boolean }

export default function BlogsAdmin() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [editItem, setEditItem] = useState<Blog | null>(null)
  const [form, setForm] = useState<Partial<Blog>>({})
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await fetch('/api/admin/blogs')
    const data = await res.json()
    setBlogs(data)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'image') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'icon') setIconFile(file)
      else setImageFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const method = editItem ? 'PUT' : 'POST'
    
    // Create FormData instead of JSON
    const formData = new FormData()
    if (editItem) formData.append('id', editItem.id)
    if (form.title) formData.append('title', form.title)
    if (form.content) formData.append('content', form.content)
    if (form.excerpt) formData.append('excerpt', form.excerpt)
    formData.append('published', form.published ? 'true' : 'false')
    
    // Append files
    if (iconFile) formData.append('icon', iconFile)
    if (imageFile) formData.append('image', imageFile)

    try {
      await fetch('/api/admin/blogs', { method, body: formData })
      setForm({})
      setIconFile(null)
      setImageFile(null)
      setEditItem(null)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
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

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Blog Icon</label>
                <div className="flex gap-2 items-center">
                  {(iconFile || form.icon) && (
                    <img src={iconFile ? URL.createObjectURL(iconFile) : form.icon} alt="Icon" className="h-8 object-contain" />
                  )}
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" disabled={submitting} asChild size="sm">
                      <span><Upload size={14} className="mr-2" />Select Icon</span>
                    </Button>
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'icon')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Blog Main Image</label>
                <div className="flex gap-2 items-center">
                  {(imageFile || form.image) && (
                    <img src={imageFile ? URL.createObjectURL(imageFile) : form.image} alt="Main Image" className="h-8 object-contain" />
                  )}
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" disabled={submitting} asChild size="sm">
                      <span><ImageIcon size={14} className="mr-2" />Select Image</span>
                    </Button>
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image')} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editItem ? 'Update' : 'Create')}</Button>
              {editItem && <Button type="button" variant="outline" onClick={() => { setEditItem(null); setForm({}); setIconFile(null); setImageFile(null) }}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Blogs</h2>
          {blogs.map(blog => (
            <Card key={blog.id} className="p-4">
              <h3 className="font-bold">{blog.title}</h3>
              <div className="flex gap-2 my-2">
                {blog.icon && <img src={blog.icon} className="h-6 w-6 object-cover rounded" alt="icon" />}
                {blog.image && <img src={blog.image} className="h-6 w-10 object-cover rounded" alt="image" />}
              </div>
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
