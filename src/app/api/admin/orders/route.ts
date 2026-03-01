import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true } },
        serviceTier: {
          include: {
            service: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, messagesUsed, callMinutesUsed } = body
    
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        messagesUsed,
        callMinutesUsed,
      },
    })
    
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
