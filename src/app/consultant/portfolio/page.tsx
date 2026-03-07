'use client'

import { useEffect, useState } from 'react'

export default function ConsultantPortfolio() {
  const [consultant, setConsultant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    hourlyRate: '',
    bio: '',
    imageUrl: ''
  })

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/consultant/portfolio')
      const data = await res.json()
      setConsultant(data)
      setFormData({
        name: data.name || '',
        specialty: data.specialty || '',
        hourlyRate: data.hourlyRate || '',
        bio: data.bio || '',
        imageUrl: data.imageUrl || ''
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await fetch('/api/consultant/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setEditing(false)
      fetchPortfolio()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const stats = {
    totalClients: consultant?.orders?.length || 0,
    activeMissions: consultant?.missions?.filter((m: any) => m.status === 'IN_PROGRESS').length || 0,
    completedMissions: consultant?.missions?.filter((m: any) => m.status === 'COMPLETED').length || 0,
    totalReservations: consultant?.reservations?.length || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <button
            onClick={() => editing ? handleUpdate() : setEditing(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                {editing ? (
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Image URL"
                    className="w-full border rounded px-3 py-2 mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                    {consultant?.imageUrl ? (
                      <img src={consultant.imageUrl} alt={consultant.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      '👤'
                    )}
                  </div>
                )}
                
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2 mb-2 text-center font-semibold"
                  />
                ) : (
                  <h2 className="text-2xl font-bold mb-2">{consultant?.name}</h2>
                )}

                {editing ? (
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Specialty"
                    className="w-full border rounded px-3 py-2 mb-2 text-center"
                  />
                ) : (
                  <p className="text-gray-600 mb-4">{consultant?.specialty || 'No specialty set'}</p>
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{consultant?.email}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Hourly Rate:</span>
                    {editing ? (
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                        className="w-24 border rounded px-2 py-1 text-right"
                      />
                    ) : (
                      <span className="font-medium">${consultant?.hourlyRate || 0}/hr</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${consultant?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {consultant?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.totalClients}</div>
                <div className="text-sm text-gray-600 mt-1">Total Clients</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.activeMissions}</div>
                <div className="text-sm text-gray-600 mt-1">Active Missions</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.completedMissions}</div>
                <div className="text-sm text-gray-600 mt-1">Completed</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.totalReservations}</div>
                <div className="text-sm text-gray-600 mt-1">Reservations</div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">About Me</h3>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Write your bio..."
                  className="w-full border rounded px-3 py-2 h-32"
                />
              ) : (
                <p className="text-gray-600">{consultant?.bio || 'No bio available'}</p>
              )}
            </div>

            {/* Recent Clients */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Clients</h3>
              <div className="space-y-3">
                {consultant?.orders?.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <div className="font-medium">{order.client.name || order.client.email}</div>
                      <div className="text-sm text-gray-500">{order.serviceTier.service.name}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      order.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
