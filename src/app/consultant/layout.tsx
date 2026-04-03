import { redirect } from 'next/navigation'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ConsultantSidebar from '@/components/ConsultantSidebar'
import Header from '@/components/Header'

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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ConsultantSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Espace Consultant" />
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>
    </div>
  )
}
