export interface NotificationPayload {
  id?: string
  type: string
  title: string
  message: string
  orderId?: string
  reservationId?: string
  data?: any
  timestamp: string
}

export function emitNotification(userId: string, payload: NotificationPayload) {
  const io = (global as any).io
  if (io) {
    console.log(`[Socket] Emitting notification to user:${userId}`, payload.title)
    io.to(`user:${userId}`).emit('notification', payload)
  } else {
    console.warn(`[Socket] WARNING: Global IO instance not found during emission to user:${userId}`)
  }
}
//  emitToRoom(`order:${orderId}`, 'new_message', message)
export function emitToRoom(room: string, event: string, payload: any) {
  const io = (global as any).io
  if (io) {
    io.to(room).emit(event, payload)
  }
}
