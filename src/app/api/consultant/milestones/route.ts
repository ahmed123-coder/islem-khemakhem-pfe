import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { missionId, title, description, dueDate } = await request.json()

    // 1. Verify mission exists and include associated order
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: { order: true }
    })

    if (!mission) {
      throw new NotFoundError('Mission', missionId);
    }

    // Verify consultant owns the mission
    if (mission.consultantId !== authResult.user.userId) {
      return handleError(new Error('Access denied - you do not own this mission'), request);
    }

    // 2. Verify order status is active
    if (mission.order.status !== 'ACTIVE') {
      return handleError(new Error('Cannot add milestones to a non-active order'), request);
    }

    const milestone = await prisma.milestone.create({
      data: {
        missionId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING'
      }
    })

    const { notifyMissionUpdate } = await import('@/lib/notification-service')
    await notifyMissionUpdate(missionId, 'Task Added', `New task "${title}" added to mission "${mission.title}".`)

    return successResponse(milestone);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { milestoneId, status, title, description } = await request.json()
    
    // Verify ownership through mission
    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { mission: true }
    })
    
    if (!existingMilestone || existingMilestone.mission.consultantId !== authResult.user.userId) {
      return handleError(new Error('Milestone not found or access denied'), request);
    }
    
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      include: { mission: true },
      data: { 
        status,
        title,
        description,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    })

    const { notifyMissionUpdate } = await import('@/lib/notification-service')
    await notifyMissionUpdate(milestone.missionId, 'Task Updated', `Task "${milestone.title}" has been updated.`)

    return successResponse(milestone);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { milestoneId } = await request.json()
    const milestone = await prisma.milestone.findUnique({ 
      where: { id: milestoneId },
      include: { mission: true }
    })
    
    if (!milestone) throw new NotFoundError('Milestone', milestoneId);
    
    if (milestone.mission.consultantId !== authResult.user.userId) {
      return handleError(new Error('Access denied - you do not own this milestone'), request);
    }

    const { notifyMissionUpdate } = await import('@/lib/notification-service')
    await notifyMissionUpdate(milestone.missionId, 'Task Removed', `Task "${milestone.title}" has been deleted.`)

    await prisma.milestone.delete({ where: { id: milestoneId } })
    return successResponse({ success: true });
  } catch (error) {
    return handleError(error, request);
  }
}
