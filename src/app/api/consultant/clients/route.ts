import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const orders = await prisma.order.findMany({
      where: { consultantId: authResult.user.userId },
      include: {
        client: { select: { id: true, name: true, email: true, firstName: true } },
        serviceTier: { include: { service: true } },
        reviews: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return successResponse(orders || []);
  } catch (error) {
    console.error('[CONSULTANT_CLIENTS_GET]', error)
    return handleError(error, request);
  }
}
