'use client'

import { useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { initSocketClient, getSocket } from '@/lib/socket-client'

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let socketInstance: any = null
    const handler = (data: { title: string; message: string; type: string }) => {
      toast(data.message, { duration: 4000 })
      window.dispatchEvent(new CustomEvent('notification', { detail: data }))
    }

    const setupSocket = async () => {
      let userId = localStorage.getItem('userId')
      let role = localStorage.getItem('role')

      if (!userId || !role) {
        try {
          const res = await fetch('/api/auth/me')
          if (res.ok) {
            const data = await res.json()
            userId = data.id || data.user?.id
            role = data.role || data.user?.role
            if (userId) localStorage.setItem('userId', userId)
            if (role) localStorage.setItem('role', role)
          }
        } catch (error) {
          console.error('Failed to fetch user for socket:', error)
        }
      }

      if (!userId || !role) return

      socketInstance = initSocketClient(userId, role)
      if (socketInstance) {
        socketInstance.on('notification', handler)
        window.dispatchEvent(new CustomEvent('socket-ready'))
      }
    }

    setupSocket()

    return () => { 
      if (socketInstance) {
        socketInstance.off('notification', handler)
      }
    }
  }, [])

  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  )
}
