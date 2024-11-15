'use client'

import { useState } from 'react'
import { FiMapPin, FiPhone, FiClock } from 'react-icons/fi'
import LocationReviews from './LocationReviews'
import type { Location } from '@/app/types/location'

type LocationDetailsProps = {
  location: Location;
  onClose: () => void;
}

export default function LocationDetails({ location: initialLocation, onClose }: LocationDetailsProps) {
  const [location, setLocation] = useState(initialLocation)

  const handleLocationUpdate = (updatedLocation: Location) => {
    setLocation(updatedLocation)
  }

  return (
    <div className="space-y-6">
      <div className="relative h-48">
        <img
          src={location.image || '/location-placeholder.jpg'}
          alt={location.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {location.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{location.type}</p>
        </div>

        <LocationReviews location={location} onUpdate={handleLocationUpdate} />

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiMapPin className="mt-1 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {location.address}
              </p>
            </div>
          </div>

          {location.phone && (
            <div className="flex items-start gap-3">
              <FiPhone className="mt-1 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Téléphone
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {location.phone}
                </p>
              </div>
            </div>
          )}

          {location.openingHours && (
            <div className="flex items-start gap-3">
              <FiClock className="mt-1 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Horaires
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {location.openingHours}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Description
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {location.description}
          </p>
        </div>
      </div>
    </div>
  )
} 