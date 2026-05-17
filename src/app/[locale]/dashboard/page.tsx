import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-lg">Welcome, {user.name || user.email}!</p>
          <p className="text-gray-600 mt-2">Role: {user.role}</p>
        </div>
      </div>
    </div>
  )
}
