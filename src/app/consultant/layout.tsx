import { redirect } from 'next/navigation'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ConsultantSidebar } from '@/components/consultant/sidebar'
import { ConsultantHeaderWithUser } from '@/components/consultant/header-wrapper'

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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      <ConsultantSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ConsultantHeaderWithUser />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
