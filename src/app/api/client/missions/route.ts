import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const missions = await prisma.mission.findMany({
      where: { clientId: user.id },
      include: {
        consultant: { select: { name: true, email: true, specialty: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(missions)
  } catch (error) {
    return NextResponse.json([])
  }
}
