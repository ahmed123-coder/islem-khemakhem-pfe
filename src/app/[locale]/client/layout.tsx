import { redirect } from 'next/navigation'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ClientSidebar from '@/components/ClientSidebar'
import Header from '@/components/Header'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

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
    <DashboardLayout
      theme="client"
      sidebar={<ClientSidebar />}
      header={<Header title="Tableau de bord Client" />}
    >
      {children}
    </DashboardLayout>
  )
}

