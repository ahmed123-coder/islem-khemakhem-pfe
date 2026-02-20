'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus } from 'lucide-react'

interface Consultant {
  id: string
  email: string
  name: string
  specialty: string | null
  createdAt: string
  _count?: { missions: number }
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      const res = await fetch('/api/admin/consultants')
      const data = await res.json()
      setConsultants(data)
    } catch (error) {
      console.error('Failed to fetch consultants:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteConsultant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultant?')) return
    
    try {
      const res = await fetch(`/api/admin/consultants/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setConsultants(consultants.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete consultant:', error)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultants Management</h1>
          <p className="text-gray-600 mt-2">Manage all consultant accounts</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {consultants.map(consultant => (
                <tr key={consultant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{consultant.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{consultant.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary">{consultant.specialty || 'N/A'}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {consultant._count?.missions || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(consultant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => deleteConsultant(consultant.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {consultants.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No consultants found
        </div>
      )}
    </div>
  )
}
