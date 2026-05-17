import { redirect } from 'next/navigation'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ConsultantSidebar } from '@/components/consultant/sidebar'
import { ConsultantHeaderWithUser } from '@/components/consultant/header-wrapper'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default async function ConsultantLayout({ children }: { children: React.ReactNode }) {
  const token = await getAuthToken()
  if (!token) redirect('/login')

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'CONSULTANT') redirect('/login')

  const consultant = await prisma.consultant.findUnique({
    where: { id: payload.userId },
    select: { isActive: true }
  })

  if (!consultant?.isActive) redirect('/login')

  return (
    <DashboardLayout
      theme="consultant"
      sidebar={<ConsultantSidebar />}
      header={<ConsultantHeaderWithUser />}
    >
      {children}
    </DashboardLayout>
  )
}

