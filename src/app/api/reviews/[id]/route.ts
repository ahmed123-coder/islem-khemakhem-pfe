import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireOwnership } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { updateConsultantRating, updateServiceRating } from '@/lib/review-service'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const { isPublished } = await req.json()
    const review = await prisma.review.update({
      where: { id: params.id },
      data: { isPublished }
    })

    // Update stats
    if (review.consultantId) {
      await updateConsultantRating(review.consultantId)
    }
    if (review.serviceId) {
      await updateServiceRating(review.serviceId)
    }

    return successResponse(review, 'Review updated successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(req, ['ADMIN', 'CLIENT'])
  if (!authResult.success) return authResult.response!

  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id }
    })

    if (!review) {
      return handleError(new Error('Review not found'), req)
    }

    // Ownership check (Admin bypasses this in requireOwnership if we implement it that way, 
    // or we check role explicitly)
    const ownershipResult = requireOwnership(authResult.user!, review.clientId)
    if (!ownershipResult.success) return ownershipResult.response!

    await prisma.review.delete({
      where: { id: params.id }
    })

    // Update stats
    if (review.consultantId) {
      await updateConsultantRating(review.consultantId)
    }
    if (review.serviceId) {
      await updateServiceRating(review.serviceId)
    }

    return successResponse({ success: true }, 'Review deleted successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

