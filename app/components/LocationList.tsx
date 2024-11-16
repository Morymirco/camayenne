'use client'

import { useState, useEffect } from 'react'
import { FiMapPin, FiClock, FiPhone, FiHeart } from 'react-icons/fi'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import type { Location } from '@/app/types/location'

export default function LocationList() {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([]) // IDs des lieux favoris

  useEffect(() => {
    // Charger les lieux depuis le localStorage
    const loadLocations = () => {
      const storedLocations = localStorage.getItem('locations')
      if (storedLocations) {
        setLocations(JSON.parse(storedLocations))
      }
      setIsLoading(false)
    }

    // Charger les favoris de l'utilisateur
    const loadFavorites = () => {
      if (user) {
        const storedFavorites = localStorage.getItem(`favorites_${user.id}`)
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites))
        }
      }
    }

    loadLocations()
    loadFavorites()

    window.addEventListener('storage', loadLocations)
    return () => window.removeEventListener('storage', loadLocations)
  }, [user])

  const handleLocationClick = (location: Location) => {
    window.dispatchEvent(new CustomEvent('centerOnLocation', {
      detail: { lat: location.latitude, lng: location.longitude }
    }))
  }

  const toggleFavorite = (locationId: number) => {
    if (!user) {
      showAlert('Veuillez vous connecter pour ajouter aux favoris', 'warning')
      return
    }

    const newFavorites = favorites.includes(locationId)
      ? favorites.filter(id => id !== locationId)
      : [...favorites, locationId]

    setFavorites(newFavorites)
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))
    
    showAlert(
      favorites.includes(locationId) ? 'Retiré des favoris' : 'Ajouté aux favoris',
      'success'
    )
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
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow cursor-pointer relative group"
        >
          {/* Bouton favori */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(location.id)
            }}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              favorites.includes(location.id)
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FiHeart
              className={`w-5 h-5 ${favorites.includes(location.id) ? 'fill-current' : ''}`}
            />
          </button>

          <div onClick={() => handleLocationClick(location)}>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2 pr-12">
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
        </div>
      ))}
    </div>
  )
} 