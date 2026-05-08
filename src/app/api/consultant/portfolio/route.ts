import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const consultant = await prisma.consultant.findUnique({
      where: { id: authResult.user.userId },
      include: {
        orders: {
          include: {
            client: { select: { name: true, email: true } },
            serviceTier: { include: { service: true } }
          }
        },
        missions: {
          include: {
            milestones: true
          }
        },
        reservations: {
          include: {
            client: { select: { name: true } }
          }
        }
      }
    })

    if (!consultant) {
      throw new NotFoundError('Consultant', authResult.user.userId);
    }

    return successResponse(consultant);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { name, specialty, hourlyRate, bio, imageUrl } = await request.json()
    
    const updated = await prisma.consultant.update({
      where: { id: authResult.user.userId },
      data: { name, specialty, hourlyRate, bio, imageUrl }
    })
    
    return successResponse(updated);
  } catch (error) {
    return handleError(error, request);
  }
}
