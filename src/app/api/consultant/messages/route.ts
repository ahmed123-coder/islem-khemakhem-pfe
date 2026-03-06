import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')
  const consultantId = req.nextUrl.searchParams.get('consultantId')
  if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  if (!consultantId) return NextResponse.json({ error: 'Consultant ID required' }, { status: 400 })

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.consultantId !== consultantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, consultantId, content } = await req.json()
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    
    if (!order?.consultantId) return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
    if (order.consultantId !== consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (order.status !== 'ACTIVE') return NextResponse.json({ error: 'Order must be active' }, { status: 400 })

    const message = await prisma.message.create({
      data: {
        orderId,
        senderId: consultantId,
        senderType: 'CONSULTANT',
        content
      }
    })
    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
