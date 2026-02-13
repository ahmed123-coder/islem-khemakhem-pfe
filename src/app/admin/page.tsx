import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-lg">Admin access granted</p>
          <p className="text-gray-600 mt-2">Logged in as: {user.email}</p>
        </div>
      </div>
    </div>
  )
}
