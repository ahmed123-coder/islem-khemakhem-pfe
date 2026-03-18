import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocketClient(userId: string, role: string): Socket {
  if (socket?.connected) return socket

  socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] })

  socket.on('connect', () => {
    socket!.emit('join', { userId, role })
  })

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
