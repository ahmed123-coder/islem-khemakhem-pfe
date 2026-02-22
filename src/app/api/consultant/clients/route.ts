import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const consultant = await prisma.consultant.findUnique({ where: { email: user.email } })
    if (!consultant) return NextResponse.json({ error: 'Consultant not found' }, { status: 404 })

    const missions = await prisma.mission.findMany({
      where: { consultantId: consultant.id },
      include: { client: { select: { id: true, name: true, email: true } } }
    })

    const clientsMap = new Map()
    missions.forEach(mission => {
      const clientId = mission.client.id
      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          id: clientId,
          name: mission.client.name,
          email: mission.client.email,
          missionCount: 0,
          activeMissions: 0
        })
      }
      const client = clientsMap.get(clientId)
      client.missionCount++
      if (mission.status === 'ACTIVE') client.activeMissions++
    })

    return NextResponse.json(Array.from(clientsMap.values()))
  } catch (error) {
    return NextResponse.json([])
  }
}
