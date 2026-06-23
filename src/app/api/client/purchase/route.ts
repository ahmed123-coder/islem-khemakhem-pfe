import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'
import { createZoomMeeting } from '@/lib/zoom'
import { BillingService } from '@/lib/billing'
import { notifyNewReservation, notifyNewOrder } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const { 
      serviceTierId, 
      consultantId, 
      startTime, 
      endTime, 
      meetingType, 
      sessionIndex, 
      sessionLabel,
      paymentMethod = 'CARD'
    } = await request.json()

    if (!serviceTierId) {
      return handleError(new Error('Missing serviceTierId'), request);
    }

    const serviceTier = await prisma.serviceTier.findUnique({
      where: { id: serviceTierId },
      include: { service: true }
    })

    if (!serviceTier) {
      throw new NotFoundError('Service tier', serviceTierId);
    }

    let consultant = null
    if (consultantId) {
      consultant = await prisma.consultant.findUnique({
        where: { id: consultantId }
      })

      if (!consultant && paymentMethod === 'CARD') {
        throw new NotFoundError('Consultant', consultantId);
      }
    }

    // --- Logic for CARD Payment (Requires Slot Validation & Instant Reservation) ---
    if (paymentMethod === 'CARD') {
      if (!startTime || !endTime) {
        return handleError(new Error('Time slots are required for card payments'), request);
      }

      // Check for overlapping reservations
      const BUFFER_MS = 15 * 60 * 1000
      const newReservationEndTime = new Date(new Date(endTime).getTime() + BUFFER_MS)

      const overlapping = await prisma.reservation.findFirst({
        where: {
          consultantId: consultantId,
          AND: [
            { startTime: { lt: newReservationEndTime } },
            { endTime: { gt: new Date(startTime) } }
          ]
        }
      })

      if (overlapping) {
        return handleError(new Error('Ce créneau est déjà réservé'), request);
      }

      // Create ACTIVE order
      const order = await prisma.order.create({
        data: {
          clientId: authResult.user.userId,
          consultantId: consultantId,
          serviceTierId: serviceTierId,
          status: 'ACTIVE',
          paymentMethod: 'CARD'
        }
      })

      // Generate Invoice
      await BillingService.createInvoiceForOrder(order.id)

      // Create reservation
      const reservationEndTime = new Date(new Date(endTime).getTime() + BUFFER_MS)
      const reservation = await prisma.reservation.create({
        data: {
          orderId: order.id,
          clientId: authResult.user.userId,
          consultantId: consultantId,
          serviceTierId: serviceTierId,
          startTime: new Date(startTime),
          endTime: reservationEndTime,
          meetingType: meetingType === 'SUR_PLACE' ? 'SUR_PLACE' : 'ZOOM',
          sessionIndex: sessionIndex || 0,
          sessionLabel: sessionLabel || null,
          status: 'PENDING'
        }
      })

      // Notify Consultant & Admin (Real-time)
      await notifyNewOrder(order.id);
      await notifyNewReservation(reservation.id);

      return successResponse({ order, reservation, consultant });
    }

    // --- Logic for VIREMENT or SUR_PLACE (Order created as PENDING, no reservation) ---
    const order = await prisma.order.create({
      data: {
        clientId: authResult.user.userId,
        consultantId: consultantId,
        serviceTierId: serviceTierId,
        status: 'PENDING',
        paymentMethod: paymentMethod as any
      }
    })

    // Generate Invoice
    await BillingService.createInvoiceForOrder(order.id)

    const message = paymentMethod === 'VIREMENT' 
      ? `Commande créée via virement bancaire. En attente de validation du paiement.` 
      : `Commande créée (paiement sur place). En attente de validation.`;

    // Notify Consultant & Admin
    await notifyNewOrder(order.id);

    const bankDetails = paymentMethod === 'VIREMENT' ? {
      bankName: "Société Générale",
      accountHolder: "EXPERT_LEARN_ADMIN",
      iban: "FR76 3000 6000 0123 4567 8901 234",
      bic: "SOGEFRRPXXX",
      rib: "30006 00001 23456789012 34"
    } : null;

    return successResponse({ 
      order, 
      bankDetails,
      paymentMethod,
      message: "Votre commande a été enregistrée. Elle sera activée dès réception de votre paiement."
    });
  } catch (error) {
    console.error('Purchase error:', error)
    return handleError(error, request);
  }
}
