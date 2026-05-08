import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  const orderId = request.nextUrl.searchParams.get('orderId')
  if (!orderId) return handleError(new Error('Order ID required'), request);

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }
    
    if (order.consultantId !== authResult.user.userId) {
      return handleError(new Error('Access denied - you do not own this order'), request);
    }

    const missions = await prisma.mission.findMany({
      where: { orderId, consultantId: authResult.user.userId },
      include: { milestones: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    })
    return successResponse(missions);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { orderId, title, description } = await request.json()
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    
    if (!order?.consultantId) return handleError(new Error('Invalid order'), request);
    if (order.consultantId !== authResult.user.userId) {
      return handleError(new Error('Access denied - you do not own this order'), request);
    }
    if (order.status !== 'ACTIVE') return handleError(new Error('Order must be active'), request);

    const mission = await prisma.mission.create({
      data: {
        orderId,
        consultantId: authResult.user.userId,
        title,
        description,
        status: 'PENDING'
      }
    })

    const { notifyMissionUpdate } = await import('@/lib/notification-service')
    await notifyMissionUpdate(mission.id, 'New Mission', `A new mission "${title}" has been created for your order.`)

    return successResponse(mission);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { missionId, title, description, status } = await request.json()
    const mission = await prisma.mission.findUnique({ where: { id: missionId } })

    if (!mission || mission.consultantId !== authResult.user.userId) {
      return handleError(new Error('Mission not found or access denied'), request);
    }

    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        title,
        description,
        status
      }
    })

    const { notifyMissionUpdate } = await import('@/lib/notification-service')
    await notifyMissionUpdate(missionId, 'Mission Updated', `Mission "${title || mission.title}" has been updated.`)

    return successResponse(updatedMission);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { missionId } = await request.json()
    const mission = await prisma.mission.findUnique({ where: { id: missionId } })

    if (!mission || mission.consultantId !== authResult.user.userId) {
      return handleError(new Error('Mission not found or access denied'), request);
    }

    const { notifyMissionUpdate } = await import('@/lib/notification-service')
    await notifyMissionUpdate(missionId, 'Mission Deleted', `Mission "${mission.title}" has been removed.`)

    await prisma.mission.delete({ where: { id: missionId } })
    return successResponse({ success: true });
  } catch (error) {
    console.error('Delete mission error:', error)
    return handleError(error, request);
  }
}
