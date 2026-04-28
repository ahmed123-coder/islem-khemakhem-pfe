import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviews = await prisma.review.findMany({
      where: {
        consultantId: user.id,
        isPublished: true,
        type: 'CONSULTANT'
      },
      include: {
        client: {
          select: {
            name: true,
            firstName: true,
          }
        },
        order: {
          include: {
            serviceTier: {
              include: {
                service: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('[CONSULTANT_REVIEWS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
