import { NextRequest } from 'next/server'
import { requireAuth, requireOwnership } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const authResult = requireAuth(req, ['CLIENT', 'ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const order = await prisma.order.findUnique({ 
      where: { id: params.orderId },
      include: { consultant: true }
    })

    if (!order) return handleError(new Error('Order not found'), req)

    const ownershipResult = requireOwnership(authResult.user!, order.clientId)
    if (!ownershipResult.success) return ownershipResult.response!

    if (!order.consultantId) {
      return successResponse([])
    }

    // Fetch all reservations for this consultant to show availability in the calendar grid
    const reservations = await prisma.reservation.findMany({
      where: {
        consultantId: order.consultantId
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        orderId: true,
        meetingType: true,
        zoomJoinUrl: true,
        zoomPassword: true,
        consultantId: true,
        consultant: {
          select: { name: true }
        }
      },
      orderBy: { startTime: 'asc' }
    })

    return successResponse(reservations)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  const authResult = requireAuth(req, ['CLIENT'])
  if (!authResult.success) return authResult.response!

  const userId = authResult.user!.userId

  try {
    const { startTime, endTime, meetingType } = await req.json()

    if (!startTime || !endTime) {
      return handleError(new Error('Champs requis manquants (startTime/endTime)'), req)
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        include: { 
          serviceTier: true,
          consultant: true,
          reservations: {
            orderBy: { sessionIndex: 'desc' }
          }
        }
      })

      if (!order) {
        throw new Error('Commande non trouvée')
      }

      const ownershipResult = requireOwnership(authResult.user!, order.clientId)
      if (!ownershipResult.success) {
        throw new Error('Unauthorized')
      }

      if (order.status !== 'ACTIVE') {
        throw new Error('Cette commande n\'est plus active')
      }

      if (!order.consultantId) {
        throw new Error('Aucun consultant n\'est assigné à cette commande')
      }

      // 1. Check for active (PENDING or CONFIRMED) reservations
      const activeReservation = order.reservations.find(r => 
        r.status === 'PENDING' || r.status === 'CONFIRMED'
      )

      if (activeReservation) {
        throw new Error('Vous avez déjà une réservation en cours. Terminez-la ou annulez-la avant d\'en prévoir une autre.')
      }

      // 2. Calculate next session index
      const completedCount = order.reservations.filter(r => r.status === 'COMPLETED').length
      const sessionsConfig = (order.serviceTier.sessionsConfig as any[]) || []

      if (completedCount >= sessionsConfig.length) {
        throw new Error('Toutes les séances de ce pack ont été consommées.')
      }

      const nextIndex = completedCount
      const sessionLabel = sessionsConfig[nextIndex]?.label || `Séance ${nextIndex + 1}`

      // 3. Check for consultant availability (overlapping)
      const BUFFER_MS = 15 * 60 * 1000
      const bufferEnd = new Date(new Date(endTime).getTime() + BUFFER_MS)

      const overlapping = await tx.reservation.findFirst({
        where: {
          consultantId: order.consultantId,
          AND: [
            { startTime: { lt: bufferEnd } },
            { endTime: { gt: new Date(startTime) } }
          ],
          NOT: { status: 'CANCELLED' }
        }
      })

      if (overlapping) {
        throw new Error('Ce créneau est déjà réservé par un autre client.')
      }

      // 4. Create the reservation with 15-minute buffer
      const reservation = await tx.reservation.create({
        data: {
          orderId: order.id,
          clientId: userId,
          consultantId: order.consultantId,
          serviceTierId: order.serviceTierId,
          startTime: new Date(startTime),
          endTime: bufferEnd,
          meetingType: meetingType === 'SUR_PLACE' ? 'SUR_PLACE' : 'ZOOM',
          sessionIndex: nextIndex,
          sessionLabel: sessionLabel,
          status: 'PENDING'
        }
      })

      // Notify the consultant
      const { notifyNewReservation } = await import('@/lib/notification-service')
      await notifyNewReservation(reservation.id)

      return reservation
    })

    return successResponse(result, 'Reservation created successfully', 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return handleError(error, req)
    }
    // Handle cases where we threw errors inside transaction
    return handleError(error, req)
  }
}

