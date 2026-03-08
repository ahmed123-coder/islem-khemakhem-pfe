import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { clientId: user.id },
      include: {
        serviceTier: {
          include: { service: true }
        },
        consultant: {
          select: { id: true, name: true, specialty: true, email: true }
        },
        missions: {
          include: { milestones: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const reservations = await prisma.reservation.findMany({
      where: { clientId: user.id },
      include: {
        serviceTier: { include: { service: true } },
        consultant: { select: { name: true, specialty: true } }
      },
      orderBy: { startTime: 'desc' }
    })

    return NextResponse.json({ orders, reservations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
