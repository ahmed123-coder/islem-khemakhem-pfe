import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'
import { notifyNewMessage } from '@/lib/notification-service'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  const orderId = request.nextUrl.searchParams.get('orderId')
  if (!orderId) return handleError(new Error('Order ID required'), request);

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }
    
    if (order.consultantId !== authResult.user.userId) {
      return handleError(new Error('Access denied - you do not own this order'), request);
    }

    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' }
    })
    return successResponse(messages);
  } catch (error) {
    console.error('Error fetching consultant messages:', error)
    return handleError(error, request);
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const body = await request.json()
    const { orderId, content } = body
    
    if (!orderId || !content) {
      return handleError(new Error('Order ID and content are required'), request);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    
    if (!order) throw new NotFoundError('Order', orderId);
    if (order.consultantId !== authResult.user.userId) {
      return handleError(new Error('Access denied - you do not own this order'), request);
    }
    if (order.status !== 'ACTIVE') {
      return handleError(new Error('Order must be active'), request);
    }

    const message = await prisma.message.create({
      data: {
        orderId,
        senderId: authResult.user.userId,
        senderType: 'CONSULTANT',
        content
      }
    })
    
    await notifyNewMessage(orderId, authResult.user.userId, 'CONSULTANT', message)
    return successResponse(message);
  } catch (error) {
    console.error('Error sending consultant message:', error)
    return handleError(error, request);
  }
}
