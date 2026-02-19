'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type Contact = { id: string; name: string; email: string; message: string; status: string; createdAt: string }

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await fetch('/api/admin/contacts')
    const data = await res.json()
    setContacts(data)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return
    await fetch(`/api/admin/contacts?id=${id}`, { method: 'DELETE' })
    loadData()
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/contacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    loadData()
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Contacts Management</h1>
      
      <div className="space-y-4 max-w-4xl">
        {contacts.map(contact => (
          <Card key={contact.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{contact.name}</h3>
                <p className="text-sm text-gray-600">{contact.email}</p>
              </div>
              <select
                value={contact.status}
                onChange={e => updateStatus(contact.id, e.target.value)}
                className="px-3 py-1 border rounded"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <p className="text-gray-700 mb-4">{contact.message}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{new Date(contact.createdAt).toLocaleString()}</span>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(contact.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
