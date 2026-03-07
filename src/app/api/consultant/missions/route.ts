import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getConsultantId } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 })

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.consultantId !== consultantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const missions = await prisma.mission.findMany({
      where: { orderId, consultantId },
      include: { milestones: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(missions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { orderId, title, description } = await req.json()
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    
    if (!order?.consultantId) return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
    if (order.consultantId !== consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (order.status !== 'ACTIVE') return NextResponse.json({ error: 'Order must be active' }, { status: 400 })

    const mission = await prisma.mission.create({
      data: {
        orderId,
        consultantId,
        title,
        description,
        status: 'PENDING'
      }
    })
    return NextResponse.json(mission)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 })
  }
}
