import { redirect } from 'next/navigation'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ClientSidebar from '@/components/ClientSidebar'
import Header from '@/components/Header'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const token = await getAuthToken()
  if (!token) redirect('/login')

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'CLIENT') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { isActive: true }
  })

  if (!user?.isActive) redirect('/login')

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Tableau de bord Client" />
        <main className="flex-1 overflow-y-auto p-0">{children}</main>
      </div>
    </div>
  )
}
