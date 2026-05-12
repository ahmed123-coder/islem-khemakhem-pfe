import { prisma } from '@/lib/prisma'
import { emitNotification, emitToRoom } from '@/lib/emit-notification'

// Helper: get all admin IDs
async function getAdminIds(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true }
  })
  return admins.map(a => a.id)
}

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

async function notifyAdmins(type: any, title: string, message: string, orderId?: string) {
  const adminIds = await getAdminIds()
  for (const adminId of adminIds) {
    await createNotification(adminId, 'ADMIN', type, title, message, orderId)
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

  await createNotification(reservation.clientId, 'CLIENT', 'RESERVATION', 'RDV mis à jour', `Votre RDV a été ${status.toLowerCase()}`, reservation.orderId ?? undefined)
  // await notifyAdmins('RESERVATION', 'RDV mis à jour', `RDV de ${reservation.client.name || reservation.client.email} : statut ${status.toLowerCase()}`, reservation.orderId ?? undefined)
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

  await createNotification(order.clientId, 'CLIENT', 'ORDER', 'Commande passée', `Votre commande pour ${order.serviceTier.service.name} a été passée.`, orderId)

  if (order.consultantId) {
    await createNotification(order.consultantId, 'CONSULTANT', 'ORDER', 'Nouvelle commande assignée', `Nouvelle commande pour ${order.serviceTier.service.name} de ${order.client.name || order.client.email}.`, orderId)
    emitToRoom(`user:${order.consultantId}`, 'notification', { type: 'ORDER', orderId, title: 'Nouvelle commande assignée', message: `Nouvelle commande de ${order.client.name || order.client.email}`, timestamp: new Date().toISOString() })
  }

  // Create DB notifications for each admin
  await notifyAdmins('ORDER', 'Nouvelle commande', `${order.client.name || order.client.email} a passé une commande pour ${order.serviceTier.service.name}`, orderId)

  // Also broadcast to the admin role room for instant real-time delivery
  emitToRoom('role:ADMIN', 'notification', {
    type: 'ORDER',
    orderId,
    title: 'Nouvelle commande',
    message: `${order.client.name || order.client.email} a passé une commande pour ${order.serviceTier.service.name}`,
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

    await createNotification(mission.consultantId, 'CONSULTANT', 'MISSION', title, message, mission.orderId)
}

export async function notifyNewClientRegistration(clientId: string) {
  const client = await prisma.user.findUnique({ where: { id: clientId } })
  if (!client) return
  await notifyAdmins('ORDER', 'Nouveau client inscrit', `${client.name || client.firstName || client.email} vient de s'inscrire en tant que client.`)
}

export async function notifyNewConsultantRegistration(consultantId: string) {
  const consultant = await prisma.consultant.findUnique({ where: { id: consultantId } })
  if (!consultant) return
  await notifyAdmins('ORDER', 'Nouveau consultant inscrit', `${consultant.name || consultant.firstName || consultant.email} vient de s'inscrire en tant que consultant. Dossier à valider.`)
}
export async function notifyNewReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({ 
    where: { id: reservationId },
    include: { client: true, order: true }
  })
  if (!reservation || !reservation.consultantId) return

  const dateStr = new Date(reservation.startTime).toLocaleString('fr-FR')

  await createNotification(reservation.consultantId, 'CONSULTANT', 'RESERVATION', 'Nouveau RDV', `Nouveau RDV de ${reservation.client.name || reservation.client.email} le ${dateStr}`, reservation.orderId ?? undefined)
  emitToRoom(`user:${reservation.consultantId}`, 'notification', { type: 'RESERVATION', orderId: reservation.orderId, title: 'Nouveau RDV', message: `RDV de ${reservation.client.name || reservation.client.email} le ${dateStr}`, timestamp: new Date().toISOString() })

  // await notifyAdmins('RESERVATION', 'Nouveau RDV', `${reservation.client.name || reservation.client.email} a pris un RDV le ${dateStr}`, reservation.orderId ?? undefined)
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

  await createNotification(recipientId as string, recipientType, 'RESERVATION', 'RDV annulé', `Un RDV avec votre ${senderLabel} a été annulé.`, reservation.orderId ?? undefined)
  // await notifyAdmins('RESERVATION', 'RDV annulé', `RDV annulé par le ${senderLabel} ${reservation.client.name || reservation.client.email}`, reservation.orderId ?? undefined)
}

