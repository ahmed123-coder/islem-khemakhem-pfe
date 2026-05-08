import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { createZoomMeeting } from '@/lib/zoom'
import { notifyReservationUpdate } from '@/lib/notification-service'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  try {
    const reservations = await prisma.reservation.findMany({
      where: { 
        consultantId: authResult.user.userId,
        ...(clientId ? { clientId } : {})
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        serviceTier: { include: { service: true } }
      },
      orderBy: { startTime: 'asc' }
    })
    return successResponse(reservations);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { id, status } = await request.json()
    const reservation = await prisma.reservation.findUnique({ 
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        serviceTier: { include: { service: true } }
      }
    })
    
    if (!reservation || reservation.consultantId !== authResult.user.userId) {
      return handleError(new Error('Access denied - you do not own this reservation'), request);
    }

    let zoomJoinUrl = reservation.zoomJoinUrl
    let zoomPassword = reservation.zoomPassword

    // If confirming the reservation, only create Zoom if meetingType is ZOOM
    if (status === 'CONFIRMED' && reservation.meetingType === 'ZOOM' && !zoomJoinUrl) {
      try {
        const durationMinutes = Math.round(
          (new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) / 60000
        )
        
        const meeting = await createZoomMeeting({
          topic: `Consultation: ${reservation.serviceTier.service.name} - ${reservation.client.name || reservation.client.email}`,
          startTime: new Date(reservation.startTime).toISOString(),
          duration: durationMinutes > 0 ? durationMinutes : 60,
        })

        zoomJoinUrl = meeting.join_url
        zoomPassword = meeting.password ?? null
      } catch (zoomError) {
        console.error('Failed to create Zoom meeting:', zoomError)
        // We can either abort the confirmation or proceed without zoom. Let's proceed but maybe log it.
        // It's safer to let the reservation be confirmed and the consultant can manually send a link if it fails.
      }
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { 
        status,
        zoomJoinUrl,
        zoomPassword
      }
    })
    await notifyReservationUpdate(id, status)
    return successResponse(updated);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { id } = await request.json()
    const { notifyReservationDelete } = await import('@/lib/notification-service')
    
    // Check ownership
    const reservation = await prisma.reservation.findUnique({ where: { id } })
    if (!reservation || reservation.consultantId !== authResult.user.userId) {
      return handleError(new Error('Access denied - you do not own this reservation'), request);
    }

    // Send notification BEFORE deleting to fetch details
    await notifyReservationDelete(id, 'CONSULTANT')

    await prisma.reservation.delete({ where: { id } })
    return successResponse({ success: true });
  } catch (error) {
    console.error('Delete error:', error)
    return handleError(error, request);
  }
}
