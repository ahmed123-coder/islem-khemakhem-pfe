import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocketClient(userId: string, role: string): Socket {
  if (!socket) {
    socket = io({ 
      path: '/socket.io', 
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    console.log('[Socket] Initializing new connection...')
  }

  // Always refresh the connect listener to use latest identity
  socket.off('connect')
  socket.on('connect', () => {
    console.log(`[Socket] Connected, emitting join for ${role}: ${userId}`)
    socket!.emit('join', { userId, role })
  })

  // If already connected, emit join immediately
  if (socket.connected) {
    console.log(`[Socket] Already connected, re-emitting join for ${role}: ${userId}`)
    socket.emit('join', { userId, role })
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
