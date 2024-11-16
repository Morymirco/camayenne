'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getLocationById } from '@/app/services/firebase/locations'
import { useAlert } from '@/app/contexts/AlertContext'

export default function SharedLocationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showAlert } = useAlert()

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const location = await getLocationById(params.id)
        if (location) {
          // Rediriger vers la carte avec les paramètres nécessaires
          router.push(`/map?locationId=${location.id}&lat=${location.latitude}&lng=${location.longitude}`)
        } else {
          showAlert('Lieu non trouvé', 'error')
          router.push('/map')
        }
      } catch (error) {
        console.error('Erreur lors du chargement du lieu:', error)
        showAlert('Erreur lors du chargement du lieu', 'error')
        router.push('/map')
      }
    }

    loadLocation()
  }, [params.id, router, showAlert])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
} 