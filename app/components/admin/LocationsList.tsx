'use client'

import { useState } from 'react'
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import Link from 'next/link'
import { useLocations } from '@/app/hooks/useData'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/app/services/firebase/config'
import { useAlert } from '@/app/contexts/AlertContext'

export default function LocationsList() {
  const { locations, isLoading } = useLocations()
  const { showAlert } = useAlert()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteDoc(doc(db, 'locations', id))
      showAlert('Lieu supprimé avec succès', 'success')
      // Recharger la page pour mettre à jour la liste
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showAlert('Erreur lors de la suppression', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Liste des lieux ({locations?.length || 0})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {locations?.map((location) => (
              <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {location.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {location.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {location.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/locations/${location.id}`}
                      className="text-blue-500 hover:text-blue-600"
                      title="Voir"
                    >
                      <FiEye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/admin/locations/${location.id}/edit`}
                      className="text-yellow-500 hover:text-yellow-600"
                      title="Modifier"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(location.id)}
                      disabled={deletingId === location.id}
                      className={`text-red-500 hover:text-red-600 ${
                        deletingId === location.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Supprimer"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!locations?.length && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun lieu trouvé
          </div>
        )}
      </div>
    </div>
  )
} 