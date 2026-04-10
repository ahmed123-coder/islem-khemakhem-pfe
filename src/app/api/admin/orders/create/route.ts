import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { clientId, serviceTierId } = await request.json()
    if (!clientId || !serviceTierId) {
      return NextResponse.json({ error: 'clientId and serviceTierId are required' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: { clientId, serviceTierId, status: 'PENDING' },
      include: {
        serviceTier: { include: { service: { select: { name: true } } } }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
