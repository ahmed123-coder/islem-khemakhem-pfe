import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireOwnership } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        serviceTier: { include: { service: true } },
        consultant: { select: { id: true, name: true, specialty: true, email: true } },
        missions: { 
          where: { NOT: { status: 'PENDING' } },
          include: { milestones: { orderBy: { createdAt: 'asc' } } } 
        },
        calls: { orderBy: { startedAt: 'desc' } }
      }
    })

    if (!order) {
      throw new NotFoundError('Order', params.orderId);
    }

    // Check ownership (ADMIN bypass)
    const ownershipResult = requireOwnership(authResult.user, order.clientId);
    if (!ownershipResult.success) {
      return ownershipResult.response;
    }

    const reviews = await prisma.review.findMany({
      where: { orderId: order.id }
    })

    const orderWithReviews = {
      ...order,
      reviews
    }

    return successResponse(orderWithReviews);
  } catch (error) {
    return handleError(error, request);
  }
}