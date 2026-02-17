'use client'

import { useState, useEffect } from 'react'

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<'navbar' | 'hero' | 'footer'>('navbar')
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchContent()
  }, [activeTab])

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/content/${activeTab}`)
      if (res.ok) {
        const data = await res.json()
        setContent(data.value)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch(`/api/content/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: content })
      })

      if (res.ok) {
        setMessage('Content updated successfully!')
      } else {
        setMessage('Failed to update content')
      }
    } catch (error) {
      setMessage('Error updating content')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (path: string, value: any) => {
    setContent((prev: any) => {
      const keys = path.split('.')
      const newContent = { ...prev }
      let current = newContent

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newContent
    })
  }

  if (!content) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Site Content Management</h1>

        <div className="flex gap-4 mb-6">
          {(['navbar', 'hero', 'footer'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {activeTab === 'navbar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Logo</label>
                <input
                  type="text"
                  value={content.logo || ''}
                  onChange={(e) => updateField('logo', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Links</label>
                {content.links?.map((link: any, i: number) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => {
                        const newLinks = [...content.links]
                        newLinks[i].label = e.target.value
                        updateField('links', newLinks)
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={link.href}
                      onChange={(e) => {
                        const newLinks = [...content.links]
                        newLinks[i].href = e.target.value
                        updateField('links', newLinks)
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <textarea
                  value={content.subtitle || ''}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CTA Text</label>
                <input
                  type="text"
                  value={content.ctaText || ''}
                  onChange={(e) => updateField('ctaText', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CTA Link</label>
                <input
                  type="text"
                  value={content.ctaLink || ''}
                  onChange={(e) => updateField('ctaLink', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={content.company || ''}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <input
                  type="text"
                  value={content.tagline || ''}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={content.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  value={content.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={content.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                <input
                  type="text"
                  value={content.social?.linkedin || ''}
                  onChange={(e) => updateField('social.linkedin', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Twitter URL</label>
                <input
                  type="text"
                  value={content.social?.twitter || ''}
                  onChange={(e) => updateField('social.twitter', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
