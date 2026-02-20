import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const consultant = await prisma.consultant.findUnique({ where: { email: user.email } })
    if (!consultant) return NextResponse.json({ error: 'Consultant not found' }, { status: 404 })

    const [totalMissions, activeMissions, completedMissions, clients] = await Promise.all([
      prisma.mission.count({ where: { consultantId: consultant.id } }),
      prisma.mission.count({ where: { consultantId: consultant.id, status: 'ACTIVE' } }),
      prisma.mission.count({ where: { consultantId: consultant.id, status: 'COMPLETED' } }),
      prisma.mission.findMany({ 
        where: { consultantId: consultant.id },
        select: { clientId: true },
        distinct: ['clientId']
      })
    ])

    return NextResponse.json({
      totalMissions,
      activeMissions,
      completedMissions,
      totalClients: clients.length
    })
  } catch (error) {
    return NextResponse.json({ totalMissions: 0, activeMissions: 0, completedMissions: 0, totalClients: 0 })
  }
}
