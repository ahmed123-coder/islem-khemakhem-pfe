import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const invoices = await prisma.invoice.findMany({
      where: { clientId: authResult.user.userId },
      include: {
        order: {
          include: {
            serviceTier: {
              include: { service: true }
            }
          }
        }
      },
      orderBy: { issueDate: 'desc' }
    })

    return successResponse(invoices);
  } catch (error) {
    console.error('List invoices error:', error)
    return handleError(error, request);
  }
}
