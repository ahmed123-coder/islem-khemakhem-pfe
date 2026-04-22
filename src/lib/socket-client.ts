import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocketClient(userId: string, role: string): Socket {
  if (!socket) {
    socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] })
    
    socket.on('connect', () => {
      console.log('[Socket] Connected, emitting join...')
      socket!.emit('join', { userId, role })
    })
  } else {
     // If already exists and connected, emit join immediately with new identity
     if (socket.connected) {
       console.log('[Socket] Already connected, re-emitting join...')
       socket.emit('join', { userId, role })
     }
  }

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
