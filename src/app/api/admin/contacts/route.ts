import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const contacts = await prisma.contact.findMany({ 
      orderBy: { createdAt: 'desc' } 
    })
    return successResponse(contacts)
  } catch (error) {
    return handleError(error, req)
  }
}

