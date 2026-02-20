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
      include: {
        client: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(missions)
  } catch (error) {
    return NextResponse.json([])
  }
}
