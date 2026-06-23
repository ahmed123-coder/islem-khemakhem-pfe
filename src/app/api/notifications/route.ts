import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req)
  if (!authResult.success) return authResult.response!

  const userId = authResult.user!.userId

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: userId },
          { consultantId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return successResponse(notifications)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = requireAuth(req)
  if (!authResult.success) return authResult.response!

  const userId = authResult.user!.userId

  try {
    const { id } = await req.json()
    if (!id) return handleError(new Error('ID is required'), req)

    // Use updateMany so it doesn't throw if not found
    await prisma.notification.updateMany({
      where: {
        id,
        OR: [
          { userId: userId },
          { consultantId: userId }
        ]
      },
      data: { isRead: true }
    })

    return successResponse({ success: true }, 'Notification marked as read')
  } catch (error) {
    return handleError(error, req)
  }
}

export async function PUT(req: NextRequest) {
  const authResult = requireAuth(req)
  if (!authResult.success) return authResult.response!

  const userId = authResult.user!.userId

  try {
    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: userId },
          { consultantId: userId }
        ],
        isRead: false
      },
      data: { isRead: true }
    })

    return successResponse({ success: true }, 'All notifications marked as read')
  } catch (error) {
    return handleError(error, req)
  }
}

