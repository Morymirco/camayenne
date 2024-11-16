'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiMapPin, FiExternalLink } from 'react-icons/fi'
import dynamic from 'next/dynamic'
import type { Location } from '@/app/types/location'

const LocationPicker = dynamic(() => import('@/app/components/admin/LocationPicker'), {
  ssr: false
})

type SharedList = {
  name: string
  locations: Location[]
}

export default function SharedListPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sharedList, setSharedList] = useState<SharedList | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      // Décoder les données de la liste partagée
      const decodedData = JSON.parse(atob(params.id))
      setSharedList(decodedData)
    } catch (error) {
      setError('Liste invalide ou expirée')
    }
  }, [params.id])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-xl font-bold text-red-500 mb-4">{error}</h1>
          <button
            onClick={() => router.push('/')}
            className="text-blue-500 hover:text-blue-600"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  if (!sharedList) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {sharedList.name}
          </h1>

          <div className="space-y-6">
            {/* Carte avec tous les lieux */}
            <div className="h-[400px] rounded-lg overflow-hidden">
              <LocationPicker
                initialLocation={[sharedList.locations[0]?.latitude || 9.5370, sharedList.locations[0]?.longitude || -13.6785]}
                readOnly
                markers={sharedList.locations.map(loc => ({
                  position: [loc.latitude, loc.longitude],
                  popup: loc.name
                }))}
              />
            </div>

            {/* Liste des lieux */}
            <div className="space-y-4">
              {sharedList.locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <FiMapPin className="mt-1 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {location.address}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {location.type}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/map?location=${location.id}`)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                    title="Voir sur la carte"
                  >
                    <FiExternalLink />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 