import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req, ['CLIENT'])
  if (!authResult.success) return authResult.response!

  const clientId = authResult.user!.userId

  try {
    const orders = await prisma.order.findMany({
      where: { clientId },
      include: {
        serviceTier: {
          include: { service: true }
        },
        consultant: {
          select: { id: true, name: true, specialty: true, email: true }
        },
        missions: {
          include: { milestones: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Manually fetch reviews to avoid Prisma Client sync issues
    const orderIds = orders.map(o => o.id)
    const reviews = await prisma.review.findMany({
      where: { orderId: { in: orderIds } }
    })

    const ordersWithReviews = orders.map(order => ({
      ...order,
      reviews: reviews.filter(r => r.orderId === order.id)
    }))

    const reservations = await prisma.reservation.findMany({
      where: { clientId },
      include: {
        serviceTier: { include: { service: true } },
        consultant: { select: { name: true, specialty: true } }
      },
      orderBy: { startTime: 'desc' }
    })

    return successResponse({ orders: ordersWithReviews, reservations })
  } catch (error) {
    return handleError(error, req)
  }
}

