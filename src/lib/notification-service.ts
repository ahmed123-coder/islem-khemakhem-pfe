import { prisma } from '@/lib/prisma'
import { emitNotification, emitToRoom } from '@/lib/emit-notification'

export async function notifyNewMessage(orderId: string, senderId: string, senderType: 'CLIENT' | 'CONSULTANT', message?: any) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return

  const recipientId = senderType === 'CLIENT' ? order.consultantId : order.clientId
  const senderLabel = senderType === 'CLIENT' ? 'client' : 'consultant'

  // Standard notification (for toasts)
  emitNotification(recipientId, {
    type: 'ORDER_MESSAGE',
    orderId,
    title: 'New Message',
    message: `You have a new message from your ${senderLabel}`,
    data: { content: message?.content },
    timestamp: new Date().toISOString()
  })

  // Real-time chat update for the order room
  emitToRoom(`order:${orderId}`, 'new_message', message)

  // Also send directly to the recipient's user room for extra reliability
  emitToRoom(`user:${recipientId}`, 'new_message', message)
}

export async function notifyReservationUpdate(reservationId: string, status: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } })
  if (!reservation) return

  emitNotification(reservation.clientId, {
    type: 'RESERVATION_UPDATE',
    reservationId,
    orderId: reservation.orderId ?? undefined,
    title: 'Reservation Updated',
    message: `Your reservation has been ${status.toLowerCase()}`,
    timestamp: new Date().toISOString()
  })
}

export async function notifyOrderStatusUpdate(orderId: string, status: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return

  emitNotification(order.clientId, {
    type: 'ORDER_STATUS_UPDATE',
    orderId,
    title: 'Order Status Updated',
    message: `Your order status is now ${status.toLowerCase()}`,
    timestamp: new Date().toISOString()
  })
}
