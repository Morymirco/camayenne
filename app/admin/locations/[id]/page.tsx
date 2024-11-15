'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiMapPin, FiPhone, FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi'
import dynamic from 'next/dynamic'
import { use } from 'react'
import { useAlert } from '@/app/contexts/AlertContext'

const LocationPicker = dynamic(() => import('../../../components/admin/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  )
})

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

export default function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [location, setLocation] = useState<Location | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { showAlert } = useAlert()

  useEffect(() => {
    const fetchLocation = () => {
      const storedLocations = localStorage.getItem('locations')
      if (storedLocations) {
        const locations = JSON.parse(storedLocations)
        const location = locations.find((loc: Location) => loc.id === parseInt(resolvedParams.id))
        if (location) {
          setLocation(location)
        } else {
          router.push('/admin')
        }
      }
    }

    fetchLocation()
  }, [resolvedParams.id, router])

  const handleDelete = () => {
    const storedLocations = localStorage.getItem('locations')
    if (storedLocations) {
      const locations = JSON.parse(storedLocations)
      const updatedLocations = locations.filter((loc: Location) => loc.id !== parseInt(resolvedParams.id))
      localStorage.setItem('locations', JSON.stringify(updatedLocations))
      showAlert('Lieu supprimé avec succès', 'success')
      router.push('/admin')
    }
  }

  if (!location) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {location.name}
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/admin/locations/${resolvedParams.id}/edit`)}
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            <FiEdit2 className="mr-2" />
            Modifier
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <FiTrash2 className="mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations générales
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-1 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{location.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiPhone className="mt-1 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{location.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiClock className="mt-1 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Horaires</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{location.openingHours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Description
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {location.description}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Emplacement
            </h2>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <LocationPicker
                initialLocation={[location.latitude, location.longitude]}
                onLocationSelect={() => {}}
                readOnly
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{location.latitude}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{location.longitude}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer {location.name} ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 