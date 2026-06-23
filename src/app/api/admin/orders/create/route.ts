import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;

  try {
    const { clientId, serviceTierId } = await request.json()
    if (!clientId || !serviceTierId) {
      return handleError(new Error('clientId and serviceTierId are required'), request);
    }

    const order = await prisma.order.create({
      data: { clientId, serviceTierId, status: 'PENDING' },
      include: {
        serviceTier: { include: { service: { select: { name: true } } } }
      }
    })

    return successResponse(order);
  } catch (error) {
    return handleError(error, request);
  }
}
