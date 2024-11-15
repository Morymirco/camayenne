'use client'

import { useEffect, useState } from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'

export type AlertType = 'success' | 'error' | 'info' | 'warning'

type AlertProps = {
  message: string
  type: AlertType
  duration?: number
  onClose?: () => void
}

const Alert = ({ message, type, duration = 3000, onClose }: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const alertStyles = {
    success: 'bg-green-50 border-green-400 text-green-700',
    error: 'bg-red-50 border-red-400 text-red-700',
    info: 'bg-blue-50 border-blue-400 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-700'
  }

  const iconMap = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    info: FiInfo,
    warning: FiAlertCircle
  }

  const Icon = iconMap[type]

  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-4 rounded-lg border ${alertStyles[type]} shadow-lg z-50`}>
      <Icon className="w-5 h-5 mr-3" />
      <span className="flex-1">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="ml-3 hover:opacity-75"
      >
        <FiX className="w-5 h-5" />
      </button>
    </div>
  )
}

export default Alert 