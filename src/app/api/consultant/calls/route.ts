import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'

const prisma = new PrismaClient()

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

    const calls = await prisma.call.findMany({
      where: { orderId },
      orderBy: { startedAt: 'desc' }
    })
    return successResponse(calls);
  } catch (error) {
    return handleError(error, request);
  }
}
