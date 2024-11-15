'use client'

import { useEffect, useState } from 'react'
import { FiMapPin, FiClock, FiPhone } from 'react-icons/fi'

type Location = {
  id: number
  name: string
  type: string
  description: string
  address: string
  phone: string
  openingHours: string
  latitude: number
  longitude: number
}

export default function LocationList() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Charger les lieux depuis le localStorage
    const loadLocations = () => {
      const storedLocations = localStorage.getItem('locations')
      if (storedLocations) {
        setLocations(JSON.parse(storedLocations))
      }
      setIsLoading(false)
    }

    loadLocations()

    // Écouter les changements dans le localStorage
    window.addEventListener('storage', loadLocations)
    return () => window.removeEventListener('storage', loadLocations)
  }, [])

  const handleLocationClick = (location: Location) => {
    // Émettre un événement pour centrer la carte sur le lieu
    window.dispatchEvent(new CustomEvent('centerOnLocation', {
      detail: { lat: location.latitude, lng: location.longitude }
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
        Aucun lieu disponible
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {locations.map((location) => (
        <div
          key={location.id}
          onClick={() => handleLocationClick(location)}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow cursor-pointer"
        >
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            {location.name}
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500 dark:text-gray-400 line-clamp-2">
              {location.description}
            </p>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiMapPin className="mr-2" />
              <span className="line-clamp-1">{location.address}</span>
            </div>
            {location.phone && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <FiPhone className="mr-2" />
                <span>{location.phone}</span>
              </div>
            )}
            {location.openingHours && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <FiClock className="mr-2" />
                <span>{location.openingHours}</span>
              </div>
            )}
            <div className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
              {location.type}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 