'use client'

import { useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/app/services/firebase/config'
import { useAlert } from '@/app/contexts/AlertContext'

export default function ClearLocations() {
  const [isClearing, setIsClearing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { showAlert } = useAlert()

  const handleClear = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer tous les lieux ? Cette action est irréversible.')) {
      return
    }

    setIsClearing(true)
    try {
      const locationsRef = collection(db, 'locations')
      const snapshot = await getDocs(locationsRef)
      
      await Promise.all(
        snapshot.docs.map(doc => deleteDoc(doc.ref))
      )

      showAlert('Tous les lieux ont été supprimés', 'success')
      window.location.reload() // Recharger la page pour mettre à jour la liste
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showAlert('Erreur lors de la suppression des lieux', 'error')
    } finally {
      setIsClearing(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isClearing}
        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        <FiTrash2 className="mr-2" />
        {isClearing ? 'Suppression...' : 'Vider la liste'}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer tous les lieux ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 