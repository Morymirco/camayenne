'use client'

import { useEffect, useState } from 'react'
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { getLocations, deleteLocation } from '@/app/services/firebase/locations'
import { useAlert } from '@/app/contexts/AlertContext'
import type { Location } from '@/app/types/location'

export default function LocationsList() {
  const router = useRouter()
  const { showAlert } = useAlert()
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const fetchedLocations = await getLocations()
        setLocations(fetchedLocations)
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error)
        showAlert('Erreur lors du chargement des lieux', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    loadLocations()
  }, [showAlert])

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteLocation(id)
        setLocations(locations.filter(loc => loc.id !== id))
        showAlert('Lieu supprimé avec succès', 'success')
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        showAlert('Erreur lors de la suppression', 'error')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Coordonnées
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {locations.map((location) => (
              <tr key={location.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {location.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {location.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => router.push(`/admin/locations/${location.id}`)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      aria-label={`Voir ${location.name}`}
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => router.push(`/admin/locations/${location.id}/edit`)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      aria-label={`Modifier ${location.name}`}
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(location.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      aria-label={`Supprimer ${location.name}`}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 