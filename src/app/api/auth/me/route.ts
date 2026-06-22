import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req)
  if (!authResult.success) return authResult.response!

  const userId = authResult.user!.userId

  try {
    // Try user table first
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user) {
      // Try consultant table
      const consultant = await prisma.consultant.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true }
      })
      
      if (consultant) {
        user = { ...consultant, role: 'CONSULTANT' } as any
      }
    }

    if (!user) {
      return handleError(new NotFoundError('User'), req)
    }

    return successResponse(user)
  } catch (error) {
    return handleError(error, req)
  }
}

