import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authenticateUser } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { updateConsultantRating, updateServiceRating } from '@/lib/review-service'

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req, ['CLIENT'])
  if (!authResult.success) return authResult.response!

  const clientId = authResult.user!.userId

  try {
    const { type, rating, comment, consultantId, orderId } = await req.json()

    // Basic validation
    if (!type || !rating || (rating < 1 || rating > 5)) {
      return handleError(new Error('Invalid rating or type'), req)
    }

    if (!orderId) {
      return handleError(new Error('Order ID is required'), req)
    }

    // Verify Order and Eligibility (Must be COMPLETED)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        serviceTier: true
      }
    })

    if (!order) {
      return handleError(new Error('Order not found'), req)
    }

    // Check for existing review of this type manually
    const existingReviews = await prisma.review.findMany({
      where: { 
        orderId,
        type
      }
    })

    if (existingReviews.length > 0) {
      return handleError(new Error(`Vous avez déjà laissé un avis sur ce ${type === 'CONSULTANT' ? 'consultant' : 'service'} pour cette commande.`), req)
    }

    if (order.clientId !== clientId) {
      return handleError(new Error('Unauthorized'), req)
    }

    if (order.status !== 'COMPLETED') {
      return handleError(new Error('Vous ne pouvez laisser un avis qu\'une fois la commande terminée (COMPLETED).'), req)
    }

    const serviceId = order.serviceTier.serviceId
    const finalConsultantId = consultantId || order.consultantId

    // Create the review
    const review = await prisma.review.create({
      data: {
        type,
        rating,
        comment,
        clientId,
        consultantId: type === 'CONSULTANT' ? finalConsultantId : null,
        orderId,
        serviceId: type === 'SERVICE' ? serviceId : null,
      }
    })

    // Update cached ratings in background (or wait)
    if (type === 'CONSULTANT' && finalConsultantId) {
      await updateConsultantRating(finalConsultantId)
    } else if (type === 'SERVICE' && serviceId) {
      await updateServiceRating(serviceId)
    }

    return successResponse(review, 'Review created successfully', 201)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const consultantId = searchParams.get('consultantId')
    const serviceId = searchParams.get('serviceId')
    const clientId = searchParams.get('clientId')

    const authResult = authenticateUser(req)
    const isAdmin = authResult.success && authResult.user?.role === 'ADMIN'

    const reviews = await prisma.review.findMany({
      where: {
        ...(consultantId && { consultantId }),
        ...(serviceId && { serviceId }),
        ...(clientId && { clientId }),
        ...(!isAdmin && { isPublished: true })
      },
      include: {
        client: {
          select: {
            name: true,
            firstName: true,
          }
        },
        consultant: {
          select: { name: true }
        },
        service: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return successResponse(reviews)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = requireAuth(req, ['CLIENT'])
  if (!authResult.success) return authResult.response!

  const clientId = authResult.user!.userId

  try {
    const { id, rating, comment } = await req.json()

    if (!id || !rating || (rating < 1 || rating > 5)) {
      return handleError(new Error('Invalid data'), req)
    }

    const review = await prisma.review.findUnique({
      where: { id }
    })

    if (!review) {
      return handleError(new Error('Review not found'), req)
    }

    if (review.clientId !== clientId) {
      return handleError(new Error('Unauthorized'), req)
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment,
      }
    })

    // Update cached ratings
    if (review.type === 'CONSULTANT' && review.consultantId) {
      await updateConsultantRating(review.consultantId)
    } else if (review.type === 'SERVICE' && review.serviceId) {
      await updateServiceRating(review.serviceId)
    }

    return successResponse(updatedReview, 'Review updated successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

