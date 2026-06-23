import { NextRequest } from 'next/server'
import { requireAuth, requireOwnership } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'
import { notifyNewMessage } from '@/lib/notification-service'

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const authResult = requireAuth(req, ['CLIENT', 'ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const order = await prisma.order.findUnique({ where: { id: params.orderId } })
    if (!order) return handleError(new Error('Order not found'), req)

    const ownershipResult = requireOwnership(authResult.user!, order.clientId)
    if (!ownershipResult.success) return ownershipResult.response!

    const messages = await prisma.message.findMany({
      where: { orderId: params.orderId },
      orderBy: { createdAt: 'asc' }
    })

    return successResponse(messages)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  const authResult = requireAuth(req, ['CLIENT'])
  if (!authResult.success) return authResult.response!

  const userId = authResult.user!.userId

  try {
    const { content } = await req.json()
    const order = await prisma.order.findUnique({ where: { id: params.orderId } })
    
    if (!order) return handleError(new Error('Order not found'), req)

    const ownershipResult = requireOwnership(authResult.user!, order.clientId)
    if (!ownershipResult.success) return ownershipResult.response!

    if (order.status !== 'ACTIVE') {
      return handleError(new Error('Order must be active'), req)
    }

    const message = await prisma.message.create({
      data: {
        orderId: params.orderId,
        senderId: userId,
        senderType: 'CLIENT',
        content
      }
    })

    await prisma.order.update({
      where: { id: params.orderId },
      data: { messagesUsed: { increment: 1 } }
    })
    await notifyNewMessage(params.orderId, userId, 'CLIENT', message)
    return successResponse(message, 'Message sent successfully', 201)
  } catch (error) {
    return handleError(error, req)
  }
}

