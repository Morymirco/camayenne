'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import Alert, { AlertType } from '../components/Alert'

type AlertContextType = {
  showAlert: (message: string, type: AlertType) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Array<{ id: number; message: string; type: AlertType }>>([])

  const showAlert = useCallback((message: string, type: AlertType) => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, message, type }])
  }, [])

  const removeAlert = useCallback((id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {alerts.map(({ id, message, type }) => (
          <Alert
            key={id}
            message={message}
            type={type}
            onClose={() => removeAlert(id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
} 