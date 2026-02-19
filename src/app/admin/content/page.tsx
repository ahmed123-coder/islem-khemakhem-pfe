'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

type ContentSection = 'navbar' | 'footer' | 'hero'

export default function ContentEditor() {
  const [section, setSection] = useState<ContentSection>('hero')
  const [content, setContent] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadContent()
  }, [section])

  const loadContent = async () => {
    const res = await fetch(`/api/content?key=${section}`)
    const data = await res.json()
    setContent(data.value || {})
  }

  const handleSave = async () => {
    setLoading(true)
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: section, value: content })
    })
    setLoading(false)
    alert('Content saved!')
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Content Editor</h1>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={() => setSection('hero')} variant={section === 'hero' ? 'default' : 'outline'}>Hero</Button>
        <Button onClick={() => setSection('navbar')} variant={section === 'navbar' ? 'default' : 'outline'}>Navbar</Button>
        <Button onClick={() => setSection('footer')} variant={section === 'footer' ? 'default' : 'outline'}>Footer</Button>
      </div>

      <Card className="p-6 max-w-3xl">
        {section === 'hero' && (
          <div className="space-y-4">
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
              <Input value={content.logoText || ''} onChange={e => setContent({ ...content, logoText: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Menu Items (JSON)</label>
              <Textarea 
                rows={6}
                value={JSON.stringify(content.menuItems || [], null, 2)} 
                onChange={e => {
                  try {
                    setContent({ ...content, menuItems: JSON.parse(e.target.value) })
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
              <Input value={content.companyName || ''} onChange={e => setContent({ ...content, companyName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea value={content.description || ''} onChange={e => setContent({ ...content, description: e.target.value })} />
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
