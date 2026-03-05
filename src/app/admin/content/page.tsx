'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { Upload, Trash2 } from 'lucide-react'

type ContentSection = 'navbar' | 'footer' | 'hero'

export default function ContentEditor() {
  const [section, setSection] = useState<ContentSection>('hero')
  const [content, setContent] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [logoUrl, setLogoUrl] = useState('/logo.jpeg')
  const [dbLogoUrl, setDbLogoUrl] = useState('')
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadContent()
    loadLogo()
    if (section === 'hero') loadHeroImages()
  }, [section])

  const loadLogo = async () => {
    const res = await fetch('/api/content/navbar')
    if (res.ok) {
      const data = await res.json()
      const url = data.value?.logoUrl || '/logo.jpeg'
      setDbLogoUrl(url)
      setLogoUrl(url)
    }
  }

  const loadContent = async () => {
    const res = await fetch(`/api/content/${section}`)
    if (res.ok) {
      const data = await res.json()
      setContent(data.value || {})
    }
  }

  const loadHeroImages = async () => {
    const res = await fetch('/api/hero')
    if (res.ok) {
      const data = await res.json()
      setHeroImages(data.images || [])
    }
  }

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('/api/upload/icon', { method: 'POST', body: formData })
      const data = await res.json()
      
      const addRes = await fetch('/api/admin/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: data.url })
      })
      
      if (addRes.ok) {
        loadHeroImages()
        alert('Image uploaded successfully!')
      }
    } catch (error) {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deleteHeroImage = async (url: string) => {
    if (!confirm('Delete this image?')) return
    
    const res = await fetch('/api/admin/hero', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: url })
    })
    
    if (res.ok) loadHeroImages()
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return
    
    const formData = new FormData()
    formData.append('logo', logoFile)
    
    setLoading(true)
    const res = await fetch('/api/upload/logo', {
      method: 'POST',
      body: formData
    })
    
    if (res.ok) {
      const data = await res.json()
      alert('Logo uploaded successfully!')
      setLogoPreview('')
      setLogoFile(null)
      // Update logo URL from response
      setLogoUrl(data.logoUrl)
      setDbLogoUrl(data.logoUrl)
    } else {
      alert('Failed to upload logo')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/content/${section}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: content })
    })
    setLoading(false)
    if (res.ok) {
      alert('Content saved!')
    } else {
      alert('Failed to save content')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Content Editor</h1>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={() => setSection('hero')} variant={section === 'hero' ? 'default' : 'outline'}>Hero</Button>
        <Button onClick={() => setSection('navbar')} variant={section === 'navbar' ? 'default' : 'outline'}>Navbar</Button>
        <Button onClick={() => setSection('footer')} variant={section === 'footer' ? 'default' : 'outline'}>Footer</Button>
      </div>

      {/* Logo Upload Section */}
      <Card className="p-6 max-w-3xl mb-6">
        <h2 className="text-xl font-bold mb-4">Logo Management</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Logo</label>
            <Image key={logoUrl} src={logoUrl} alt="Logo" width={100} height={100} className="rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Upload New Logo</label>
            <Input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleLogoChange} />
          </div>
          {logoPreview && (
            <div>
              <label className="block text-sm font-medium mb-2">Preview</label>
              <img src={logoPreview} alt="Preview" className="w-24 h-24 rounded-lg" />
            </div>
          )}
          <Button onClick={handleLogoUpload} disabled={!logoFile || loading}>
            {loading ? 'Uploading...' : 'Upload Logo'}
          </Button>
        </div>
      </Card>

      <Card className="p-6 max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Edit {section.charAt(0).toUpperCase() + section.slice(1)} Content</h2>
        
        {section === 'hero' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hero Background Images</label>
              <div className="mb-4">
                <label className="cursor-pointer">
                  <Button type="button" disabled={uploading || heroImages.length >= 3} asChild>
                    <span>{uploading ? 'Uploading...' : <><Upload size={16} className="mr-2" />Upload Image</>}</span>
                  </Button>
                  <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" disabled={heroImages.length >= 3} />
                </label>
                <p className="text-xs text-gray-500 mt-2">Max 3 images. Multiple images create slideshow animation.</p>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {heroImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt={`Hero ${index + 1}`} className="w-full h-32 object-cover rounded" />
                    <Button size="sm" variant="destructive" onClick={() => deleteHeroImage(img)} className="absolute top-2 right-2">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input value={content.title || ''} onChange={e => setContent({ ...content, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <Textarea value={content.subtitle || ''} onChange={e => setContent({ ...content, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Text</label>
              <Input value={content.ctaText || ''} onChange={e => setContent({ ...content, ctaText: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Link</label>
              <Input value={content.ctaLink || ''} onChange={e => setContent({ ...content, ctaLink: e.target.value })} />
            </div>
          </div>
        )}

        {section === 'navbar' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Logo Text</label>
              <Input value={content.logo || ''} onChange={e => setContent({ ...content, logo: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Menu Links (JSON)</label>
              <Textarea 
                rows={8}
                value={JSON.stringify(content.links || [], null, 2)} 
                onChange={e => {
                  try {
                    setContent({ ...content, links: JSON.parse(e.target.value) })
                  } catch {}
                }} 
              />
              <p className="text-xs text-gray-500 mt-1">Format: [{`{"label": "Home", "href": "/"}`}]</p>
            </div>
          </div>
        )}

        {section === 'footer' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <Input value={content.company || ''} onChange={e => setContent({ ...content, company: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tagline</label>
              <Textarea value={content.tagline || ''} onChange={e => setContent({ ...content, tagline: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input value={content.email || ''} onChange={e => setContent({ ...content, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input value={content.phone || ''} onChange={e => setContent({ ...content, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <Input value={content.address || ''} onChange={e => setContent({ ...content, address: e.target.value })} />
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={loading} className="mt-6">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Card>
    </div>
  )
}
