import { NextRequest } from 'next/server'
import { requireAuth, requireOwnership } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'
import { getTotalMinutes, getUsedMinutes, hasBlockingReservation, countFinishedSessions, MIN_SESSION_MINUTES } from '@/lib/sessions-config'

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

      // 1. Vérifie qu'aucune réservation ne bloque la prochaine séance
      //    - PENDING (en attente de confirmation du consultant) → bloque
      //    - CONFIRMED dont la réunion n'a pas encore eu lieu → bloque
      //    - CONFIRMED dont l'heure est déjà passée → NE bloque PAS
      //      (compté comme "terminée" même si le consultant n'a pas cliqué "Terminer")
      if (hasBlockingReservation(order.reservations as any)) {
        throw new Error('Vous avez déjà une réservation en cours. Terminez-la ou annulez-la avant d\'en prévoir une autre.')
      }

      // 2. Calcule le budget de temps restant (maxCallDuration - minutes utilisées)
      const total      = getTotalMinutes(order.serviceTier)
      const used       = getUsedMinutes(order.reservations as any)
      const nextIndex  = countFinishedSessions(order.reservations as any)
      const sessionLabel = `Séance ${nextIndex + 1}`

      // Durée demandée par le client (en minutes, sans le buffer)
      const requestedMinutes = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000

      if (total !== null) {
        // Pack à budget (BASIC/STANDARD/PREMIUM) : reste-t-il assez de temps ?
        const remaining = total - used

        if (remaining < MIN_SESSION_MINUTES) {
          throw new Error('Toutes les séances de ce pack ont été consommées.')
        }

        // La durée demandée ne doit pas dépasser le temps restant
        // (+0.5 min de tolérance pour les arrondis)
        if (requestedMinutes > remaining + 0.5) {
          const heures = Math.floor(remaining / 60)
          const minutes = Math.round(remaining % 60)
          throw new Error(`La durée demandée dépasse le temps restant (${heures}h${minutes > 0 ? minutes : ''}).`)
        }
      } else {
        // Pack illimité (ULTIMATE) : le projet est-il clôturé par le consultant ?
<<<<<<< HEAD
        if (String(order.status) === 'COMPLETED') {
=======
        if ((order.status as string) === 'COMPLETED') {
>>>>>>> 1f2e273 (Initial commit)
          throw new Error('Ce projet est terminé. Aucune nouvelle séance ne peut être réservée.')
        }
      }

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

      return reservation
    })

    // Notify the consultant AFTER transaction is committed
    const { notifyNewReservation } = await import('@/lib/notification-service')
    await notifyNewReservation(result.id)

    return successResponse(result, 'Reservation created successfully', 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return handleError(error, req)
    }
    // Handle cases where we threw errors inside transaction
    return handleError(error, req)
  }
}