'use client'

import { useState, useEffect } from 'react'
import { FiMail, FiCheck, FiClock } from 'react-icons/fi'
import { getUserMessages, Message } from '@/app/services/firebase/messages'
import { useAuth } from '@/app/contexts/AuthContext'

export default function UserMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return
      try {
        const userMessages = await getUserMessages(user.uid)
        setMessages(userMessages)
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <FiMail className="mr-2" />
          Messages
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {messages.length} message{messages.length !== 1 && 's'}
        </span>
      </div>

      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.fromAdmin
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    message.fromAdmin
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {message.fromAdmin ? 'Admin' : 'Système'}
                  </span>
                  {message.read && (
                    <span className="ml-2 text-green-500 flex items-center text-xs">
                      <FiCheck className="mr-1" />
                      Lu
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <FiClock className="mr-1" />
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Aucun message
        </p>
      )}
    </div>
  )
} 