import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        consultantId: authResult.user.userId,
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

    return successResponse(reviews);
  } catch (error) {
    console.error('[CONSULTANT_REVIEWS_GET]', error)
    return handleError(error, request);
  }
}
