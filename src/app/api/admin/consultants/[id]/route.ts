import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    await prisma.consultant.update({
      where: { id: params.id },
      data: { isActive: false }
    })
    return successResponse({ success: true }, 'Consultant deactivated')
  } catch (error) {
    return handleError(error, req)
  }
}

