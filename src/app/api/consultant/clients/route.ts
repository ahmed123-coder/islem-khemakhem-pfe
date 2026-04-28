import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getConsultantId } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const orders = await prisma.order.findMany({
      where: { consultantId },
      include: {
        client: { select: { id: true, name: true, email: true, firstName: true } },
        serviceTier: { include: { service: true } },
        reviews: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('[CONSULTANT_CLIENTS_GET]', error)
    return NextResponse.json([], { status: 500 })
  }
}
