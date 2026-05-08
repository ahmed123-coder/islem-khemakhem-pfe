import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireOwnership } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'
import { notifyReservationDelete } from '@/lib/notification-service'

export async function DELETE(request: NextRequest) {
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { id } = await request.json()
    const reservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!reservation) {
      throw new NotFoundError('Reservation', id);
    }

    // Check ownership (ADMIN bypass)
    const ownershipResult = requireOwnership(authResult.user, reservation.clientId);
    if (!ownershipResult.success) {
      return ownershipResult.response;
    }

    // Client can only delete PENDING reservations
    if (reservation.status !== 'PENDING') {
      return handleError(new Error('You can only cancel pending reservations'), request);
    }

    await notifyReservationDelete(id, 'CLIENT')
    await prisma.reservation.delete({ where: { id } })

    return successResponse({ success: true });
  } catch (error) {
    console.error('Reservation cancellation error:', error)
    return handleError(error, request);
  }
}
