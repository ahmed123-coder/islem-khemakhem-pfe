'use client'

import { useState, useEffect } from 'react'
import { Bell, MessageSquare, Calendar, Rocket, Info, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'ORDER' | 'MESSAGE' | 'CALL' | 'MISSION' | 'RESERVATION' | 'SYSTEM'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  orderId?: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()

    const handleNewNotification = (e: any) => {
      const newNotif = {
        id: Math.random().toString(36).substr(2, 9), // Temporary ID until refresh
        ...e.detail,
        isRead: false,
        createdAt: new Date().toISOString()
      }
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
    }

    window.addEventListener('notification', handleNewNotification)
    return () => window.removeEventListener('notification', handleNewNotification)
  }, [])

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length)
  }, [notifications])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications')
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (error) {
      console.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Failed to mark all as read')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE': return <MessageSquare size={16} className="text-blue-500" />
      case 'RESERVATION': return <Calendar size={16} className="text-purple-500" />
      case 'MISSION': return <Rocket size={16} className="text-orange-500" />
      case 'ORDER': return <CheckCircle2 size={16} className="text-green-500" />
      default: return <Info size={16} className="text-gray-500" />
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
      >
        <Bell size={24} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Tout marquer comme lu
              </button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-gray-500">Aucune notification</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full"></div>
                    )}
                    <div className="flex gap-3">
                      <div className="mt-1 flex-shrink-0 p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-100">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 mb-0.5 truncate">{notification.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{notification.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 text-center bg-gray-50/50 border-t border-gray-50">
              <Link 
                href={localStorage.getItem('role') === 'CONSULTANT' ? '/consultant/settings' : '/client/notifications'}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Voir toutes les notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
