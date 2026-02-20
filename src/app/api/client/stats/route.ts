import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [totalMissions, activeMissions, completedMissions, pendingMissions] = await Promise.all([
      prisma.mission.count({ where: { clientId: user.id } }),
      prisma.mission.count({ where: { clientId: user.id, status: 'ACTIVE' } }),
      prisma.mission.count({ where: { clientId: user.id, status: 'COMPLETED' } }),
      prisma.mission.count({ where: { clientId: user.id, status: 'PENDING' } })
    ])

    return NextResponse.json({
      totalMissions,
      activeMissions,
      completedMissions,
      pendingMissions
    })
  } catch (error) {
    return NextResponse.json({ totalMissions: 0, activeMissions: 0, completedMissions: 0, pendingMissions: 0 })
  }
}
