'use client'

import { useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { initSocketClient, getSocket } from '@/lib/socket-client'

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')
    if (!userId || !role) return

    initSocketClient(userId, role)
    const socket = getSocket()
    if (!socket) return

    const handler = (data: { title: string; message: string; type: string }) => {
      toast(data.message, { duration: 4000 })
      window.dispatchEvent(new CustomEvent('notification', { detail: data }))
    }

    socket.on('notification', handler)
    return () => { socket.off('notification', handler) }
  }, [])

  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  )
}
