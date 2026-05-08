import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { orderId } = params
    const { status } = await request.json()
    
    console.log('[Order Status API] Updating order:', orderId, 'to status:', status, 'by consultant:', authResult.user.userId)

    // Verify order ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    if (order.consultantId !== authResult.user.userId) {
      return handleError(new Error('Access denied - you do not own this order'), request);
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

    return successResponse(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error)
    return handleError(error, request);
  }
}
