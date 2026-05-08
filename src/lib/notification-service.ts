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

  if (reservation.orderId) {
    emitToRoom(`order:${reservation.orderId}`, 'notification', {
      type: 'RESERVATION',
      orderId: reservation.orderId,
      title: 'Reservation Updated',
      message: `Reservation status changed to ${status.toLowerCase()}`,
      timestamp: new Date().toISOString()
    })
  }
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

export async function notifyNewOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true, serviceTier: { include: { service: true } } }
  })
  if (!order) return

  // 1. Notify Client (Confirmation)
  await createNotification(
    order.clientId,
    'CLIENT',
    'ORDER',
    'Order Placed',
    `Your order for ${order.serviceTier.service.name} has been placed.`,
    orderId
  )

  // 2. Notify Consultant (if assigned)
  if (order.consultantId) {
    await createNotification(
      order.consultantId,
      'CONSULTANT',
      'ORDER',
      'New Order Assigned',
      `You have been assigned a new order for ${order.serviceTier.service.name} from ${order.client.name || order.client.email}.`,
      orderId
    )
    
    // Real-time socket
    emitToRoom(`user:${order.consultantId}`, 'notification', {
      type: 'ORDER',
      orderId,
      title: 'New Order Assigned',
      message: `New order for ${order.serviceTier.service.name} from ${order.client.name || order.client.email}`,
      timestamp: new Date().toISOString()
    })
  }

  // 3. Notify Admin (Global)
  // We don't have a specific Admin ID, but we could emit to role:ADMIN room
  emitToRoom('role:ADMIN', 'notification', {
    type: 'ORDER',
    orderId,
    title: 'New Site Order',
    message: `A new order has been placed by ${order.client.name || order.client.email}`,
    timestamp: new Date().toISOString()
  })
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

export async function notifyConsultantMilestoneUpdate(missionId: string, title: string, message: string) {
    const mission = await prisma.mission.findUnique({ 
        where: { id: missionId },
        include: { order: true }
    })
    if (!mission || !mission.consultantId) return

    await createNotification(
        mission.consultantId,
        'CONSULTANT',
        'MISSION',
        title,
        message,
        mission.orderId
    )
}
export async function notifyNewReservation(reservationId: string) {
  console.log(`[Notification] Starting notifyNewReservation for ${reservationId}`)
  const reservation = await prisma.reservation.findUnique({ 
    where: { id: reservationId },
    include: { client: true, order: true }
  })
  
  if (!reservation) {
    console.warn(`[Notification] Reservation ${reservationId} not found`)
    return
  }

  if (!reservation.consultantId) {
    console.warn(`[Notification] Reservation ${reservationId} has no consultantId`)
    return
  }

  const payload = {
    id: reservation.id,
    type: 'RESERVATION',
    orderId: reservation.orderId,
    title: 'New Reservation',
    message: `New reservation from ${reservation.client.name || reservation.client.email} for ${new Date(reservation.startTime).toLocaleString()}`,
    timestamp: new Date().toISOString()
  }

  console.log(`[Notification] Creating DB entry and emitting to consultant: ${reservation.consultantId}`)
  
  await createNotification(
    reservation.consultantId,
    'CONSULTANT',
    'RESERVATION',
    payload.title,
    payload.message,
    reservation.orderId ?? undefined
  )

  // Double emission to ensure the room name matches (user:id)
  emitToRoom(`user:${reservation.consultantId}`, 'notification', payload)
  console.log(`[Notification] Success: Emitted to user:${reservation.consultantId}`)

  if (reservation.orderId) {
    emitToRoom(`order:${reservation.orderId}`, 'notification', payload)
  }
}

export async function notifyReservationDelete(reservationId: string, deletedBy: 'CLIENT' | 'CONSULTANT') {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { client: true, order: true }
  })
  if (!reservation) return

  const recipientId = deletedBy === 'CLIENT' ? reservation.consultantId : reservation.clientId
  const recipientType = deletedBy === 'CLIENT' ? 'CONSULTANT' : 'CLIENT'
  const senderLabel = deletedBy === 'CLIENT' ? 'client' : 'consultant'

  await createNotification(
    recipientId as string,
    recipientType,
    'RESERVATION',
    'Reservation Cancelled',
    `A reservation with your ${senderLabel} has been deleted.`,
    reservation.orderId ?? undefined
  )

  if (reservation.orderId) {
    emitToRoom(`order:${reservation.orderId}`, 'notification', {
      type: 'RESERVATION',
      orderId: reservation.orderId,
      title: 'Reservation Cancelled',
      message: `A reservation has been deleted by the ${senderLabel}`,
      timestamp: new Date().toISOString()
    })
  }
}

