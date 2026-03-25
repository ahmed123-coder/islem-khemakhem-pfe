import { prisma } from '@/lib/prisma'
import { emitNotification, emitToRoom } from '@/lib/emit-notification'

async function createNotification(recipientId: string, recipientType: 'CLIENT' | 'CONSULTANT' | 'ADMIN', type: any, title: string, message: string, orderId?: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: recipientType !== 'CONSULTANT' ? recipientId : null,
        consultantId: recipientType === 'CONSULTANT' ? recipientId : null,
        type,
        title,
        message,
      }
    })

    emitNotification(recipientId, {
      id: notification.id,
      type,
      orderId,
      title,
      message,
      timestamp: notification.createdAt.toISOString()
    })

    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

export async function notifyNewMessage(orderId: string, senderId: string, senderType: 'CLIENT' | 'CONSULTANT', message?: any) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return

  const recipientId = senderType === 'CLIENT' ? order.consultantId : order.clientId
  const recipientType = senderType === 'CLIENT' ? 'CONSULTANT' : 'CLIENT'
  const senderLabel = senderType === 'CLIENT' ? 'client' : 'consultant'

  if (recipientId) {
    await createNotification(
      recipientId as string,
      recipientType,
      'MESSAGE',
      'New Message',
      `You have a new message from your ${senderLabel}`,
      orderId
    )
  }

  // Real-time chat update for the order room
  emitToRoom(`order:${orderId}`, 'new_message', message)

  // Also send directly to the recipient's user room for extra reliability
  if (recipientId) {
    emitToRoom(`user:${recipientId}`, 'new_message', message)
  }
}

export async function notifyReservationUpdate(reservationId: string, status: string) {
  const reservation = await prisma.reservation.findUnique({ 
    where: { id: reservationId },
    include: { client: true }
  })
  if (!reservation) return

  await createNotification(
    reservation.clientId,
    'CLIENT',
    'RESERVATION',
    'Reservation Updated',
    `Your reservation has been ${status.toLowerCase()}`,
    reservation.orderId ?? undefined
  )
}

export async function notifyOrderStatusUpdate(orderId: string, status: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return

  await createNotification(
    order.clientId,
    'CLIENT',
    'ORDER',
    'Order Status Updated',
    `Your order status is now ${status.toLowerCase()}`,
    orderId
  )
}

export async function notifyMissionUpdate(missionId: string, title: string, message: string) {
    const mission = await prisma.mission.findUnique({ 
        where: { id: missionId },
        include: { order: true }
    })
    if (!mission) return

    await createNotification(
        mission.order.clientId,
        'CLIENT',
        'MISSION',
        title,
        message,
        mission.orderId
    )
}
export async function notifyNewReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({ 
    where: { id: reservationId },
    include: { client: true, order: true }
  })
  if (!reservation || !reservation.consultantId) return

  await createNotification(
    reservation.consultantId,
    'CONSULTANT',
    'RESERVATION',
    'New Reservation Request',
    `New reservation from ${reservation.client.name || reservation.client.email} for ${new Date(reservation.startTime).toLocaleString()}`,
    reservation.orderId ?? undefined
  )
}
