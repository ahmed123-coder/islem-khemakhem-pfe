import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientId, getCurrentUser } from '@/lib/auth'
import { updateConsultantRating, updateServiceRating } from '@/lib/review-service'

export async function POST(req: NextRequest) {
  const clientId = await getClientId()
  if (!clientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { type, rating, comment, consultantId, orderId } = await req.json()

    // Basic validation
    if (!type || !rating || (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Invalid rating or type' }, { status: 400 })
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Verify Order and Eligibility (Must be COMPLETED)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        serviceTier: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check for existing review of this type manually
    const existingReviews = await prisma.review.findMany({
      where: { 
        orderId,
        type
      }
    })

    if (existingReviews.length > 0) {
      return NextResponse.json({ error: `Vous avez déjà laissé un avis sur ce ${type === 'CONSULTANT' ? 'consultant' : 'service'} pour هذه الطلبية.` }, { status: 400 })
    }

    if (order.clientId !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Vous ne pouvez laisser un avis qu\'une fois la commande terminée (COMPLETED).' }, { status: 403 })
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

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('[REVIEWS_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const consultantId = searchParams.get('consultantId')
    const serviceId = searchParams.get('serviceId')
    const clientId = searchParams.get('clientId')

    const user = await getCurrentUser()
    const isAdmin = user?.role === 'ADMIN'

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

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('[REVIEWS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
