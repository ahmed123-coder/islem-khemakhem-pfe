import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { updateConsultantRating, updateServiceRating } from '@/lib/review-service'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

    return NextResponse.json(review)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized', 
      _debug: { hasUser: !!user, role: user?.role } 
    }, { status: 401 })
  }

  try {
    const review = await prisma.review.delete({
      where: { id: params.id }
    })

    // Update stats
    if (review.consultantId) {
      await updateConsultantRating(review.consultantId)
    }
    if (review.serviceId) {
      await updateServiceRating(review.serviceId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
