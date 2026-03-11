import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        serviceTier: { include: { service: true } },
        consultant: { select: { id: true, name: true, specialty: true, email: true } },
        missions: { 
          where: { NOT: { status: 'PENDING' } },
          include: { milestones: true } 
        },
        calls: { orderBy: { startedAt: 'desc' } }
      }
    })

    if (!order || order.clientId !== user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
