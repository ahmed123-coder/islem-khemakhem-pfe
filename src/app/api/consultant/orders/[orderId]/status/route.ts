import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getConsultantId } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { orderId } = params
    const { status } = await req.json()
    
    console.log('[Order Status API] Updating order:', orderId, 'to status:', status, 'by consultant:', consultantId)

    // Verify order ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.consultantId !== consultantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    // Notify client
    try {
      const { notifyOrderStatusUpdate } = await import('@/lib/notification-service')
      await notifyOrderStatusUpdate(orderId, status)
    } catch (notifyError) {
      console.error('Failed to send notification:', notifyError)
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Update order status error:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
