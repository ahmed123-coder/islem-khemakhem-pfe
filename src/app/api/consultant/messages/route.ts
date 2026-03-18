import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getConsultantId } from '@/lib/auth'
import { notifyNewMessage } from '@/lib/notification-service'

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

    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching consultant messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { orderId, content } = body
    
    if (!orderId || !content) {
      return NextResponse.json({ error: 'Order ID and content are required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
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
    
    await notifyNewMessage(orderId, consultantId, 'CONSULTANT')
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending consultant message:', error)
    return NextResponse.json({ error: 'Failed to send message', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
