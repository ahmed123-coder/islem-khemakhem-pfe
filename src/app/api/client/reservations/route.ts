import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireOwnership } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'
import { notifyReservationDelete, notifyReservationUpdate } from '@/lib/notification-service'

export async function POST(request: NextRequest) {

  // 1. Vérifier que l'utilisateur est connecté en tant que CLIENT
  const authResult = requireAuth(request, ['CLIENT'])
  if (!authResult.success || !authResult.user) return authResult.response

  try {

    // 2. Lire les données envoyées par le formulaire
    const body         = await request.json()
    const orderId      = body.orderId       // ID de la commande liée
    const startTime    = body.startTime     // Date et heure de début  ex: "2026-06-15T10:00:00"
    const endTime      = body.endTime       // Date et heure de fin    ex: "2026-06-15T11:00:00"
    const meetingType  = body.meetingType   // "ZOOM" ou "SUR_PLACE"
    const notes        = body.notes         // Remarques du client (optionnel)

    // 3. Vérifier que la commande existe et appartient à ce client
    const order = await prisma.order.findUnique({
      where: {
        id: orderId
      },
      include: {
        serviceTier: true
      }
    })

    const orderNotFound      = !order
    const orderNotOwnedByMe  = order && order.clientId !== authResult.user.userId

    if (orderNotFound || orderNotOwnedByMe) {
      return handleError(
        new Error('Order not found or access denied'),
        request
      )
    }

    // 4. Créer la réservation en base de données avec statut PENDING
    //    Le consultant doit confirmer pour que le lien Zoom soit généré
    const reservation = await prisma.reservation.create({
      data: {
        clientId:      authResult.user.userId,    // ID du client connecté
        consultantId:  order.consultantId!,        // ID du consultant de la commande
        orderId:       orderId,                    // Lien avec la commande
        serviceTierId: order.serviceTierId,        // Formule choisie (Basic, Premium...)
        startTime:     new Date(startTime),        // Convertir string → Date
        endTime:       new Date(endTime),          // Convertir string → Date
        meetingType:   meetingType || 'ZOOM',      // Par défaut : réunion en ligne
        status:        'PENDING',                  // En attente de confirmation du consultant
        notes:         notes || null,              // Remarques optionnelles
      }
    })

    // 5. Envoyer une notification au consultant
    //    Il recevra : "Nouvelle demande de RDV de [client]"
    await notifyReservationUpdate(reservation.id, 'PENDING')

    // 6. Retourner la réservation créée
    return successResponse(reservation)

  } catch (error) {
    return handleError(error, request)
  }
}

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