export interface NotificationPayload {
  type: string
  title: string
  message: string
  orderId?: string
  reservationId?: string
  data?: Record<string, unknown>
  timestamp: string
}

export function emitNotification(userId: string, payload: NotificationPayload) {
  const io = (global as any).io
  if (io) {
    io.to(`user:${userId}`).emit('notification', payload)
  }
}
