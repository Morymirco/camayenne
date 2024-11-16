'use client'

import { FiX, FiMapPin, FiPhone, FiClock, FiStar } from 'react-icons/fi'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  location: {
    title: string
    description: string
    image: string
    address?: string
    phone?: string
    openingHours?: string
    rating?: number
    reviews?: number
  }
}

export default function MapModal({ isOpen, onClose, location }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Image d'en-tête */}
        <div className="relative h-48 md:h-64">
          <img
            src={location.image || '/location-placeholder.jpg'}
            alt={location.title}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {location.title}
          </h2>

          {/* Note et avis */}
          {location.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < location.rating! ? 'fill-current' : 'stroke-current'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({location.reviews || 0} avis)
              </span>
            </div>
          )}

          {/* Informations détaillées */}
          <div className="space-y-4 mb-6">
            {location.address && (
              <div className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Adresse
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {location.address}
                  </p>
                </div>
              </div>
            )}

            {location.phone && (
              <div className="flex items-start gap-3">
                <FiPhone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
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
                <FiClock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {location.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              Obtenir l'itinéraire
            </button>
            <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Partager
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 