'use client'

import { useState, useEffect } from 'react'
import { FiBell, FiCheck, FiInfo, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '@/app/contexts/AuthContext'
import { getNotifications, markNotificationAsRead, Notification } from '@/app/services/firebase/notifications'

export default function NotificationsPanel() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return
      try {
        const userNotifications = await getNotifications(user.uid)
        setNotifications(userNotifications)
        setUnreadCount(userNotifications.filter(n => !n.read).length)
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error)
      }
    }

    loadNotifications()
  }, [user])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return <FiInfo className="text-blue-500" />
      case 'system':
        return <FiAlertTriangle className="text-yellow-500" />
      case 'social':
        return <FiBell className="text-green-500" />
      default:
        return <FiBell className="text-gray-500" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Marquer comme lu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Aucune notification
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 