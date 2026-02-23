'use client'

import { useEffect, useState } from 'react'
import { User, Settings } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  name: string
  email: string
}

export default function ConsultantDashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setUser(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Consultant Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'Consultant'}!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4 mb-4">
            <User className="text-blue-500" size={40} />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Profile</h2>
              <p className="text-gray-600 text-sm">Manage your account</p>
            </div>
          </div>
          <Link href="/consultant/settings" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Profile →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4 mb-4">
            <Settings className="text-purple-500" size={40} />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Settings</h2>
              <p className="text-gray-600 text-sm">Update your preferences</p>
            </div>
          </div>
          <Link href="/consultant/settings" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Go to Settings →
          </Link>
        </div>
      </div>
    </div>
  )
}
