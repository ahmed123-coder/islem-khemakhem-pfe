import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireOwnership } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'

export async function PATCH(request: NextRequest) {
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { milestoneId, status } = await request.json()

    if (!['PENDING', 'COMPLETED'].includes(status)) {
      return handleError(new Error('Invalid status'), request);
    }

    // Verify the milestone belongs to a mission in an order owned by this client
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        mission: {
          include: {
            order: true
          }
        }
      }
    })

    if (!milestone) {
      throw new NotFoundError('Milestone', milestoneId);
    }

    // Check ownership (ADMIN bypass)
    const ownershipResult = requireOwnership(authResult.user, milestone.mission.order.clientId);
    if (!ownershipResult.success) {
      return ownershipResult.response;
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    })

    const { notifyConsultantMilestoneUpdate } = await import('@/lib/notification-service')
    await notifyConsultantMilestoneUpdate(milestone.missionId, 'Task Updated', `Task "${milestone.title}" has been updated.`)

    return successResponse(updatedMilestone);
  } catch (error) {
    return handleError(error, request);
  }
}
