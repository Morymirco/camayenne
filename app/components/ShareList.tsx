'use client'

import { useState } from 'react'
import { FiShare2, FiCopy, FiMail, FiMessageSquare } from 'react-icons/fi'
import { useAlert } from '@/app/contexts/AlertContext'
import type { Location } from '@/app/types/location'

type ShareListProps = {
  locations: Location[]
  listName?: string
}

export default function ShareList({ locations, listName = 'Ma liste' }: ShareListProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const { showAlert } = useAlert()

  const generateShareLink = () => {
    const shareData = {
      name: listName,
      locations: locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        type: loc.type,
        address: loc.address,
        coordinates: [loc.latitude, loc.longitude]
      }))
    }
    
    // Encoder les données en base64 pour le partage
    return `${window.location.origin}/shared-list/${btoa(JSON.stringify(shareData))}`
  }

  const handleCopyLink = async () => {
    const link = generateShareLink()
    try {
      await navigator.clipboard.writeText(link)
      showAlert('Lien copié dans le presse-papier', 'success')
    } catch (error) {
      showAlert('Erreur lors de la copie du lien', 'error')
    }
  }

  const handleEmailShare = () => {
    const link = generateShareLink()
    const subject = encodeURIComponent(`Liste de lieux à Camayenne: ${listName}`)
    const body = encodeURIComponent(`Découvrez cette liste de lieux à Camayenne:\n\n${link}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleWhatsAppShare = () => {
    const link = generateShareLink()
    const text = encodeURIComponent(`Découvrez cette liste de lieux à Camayenne: ${link}`)
    window.open(`https://wa.me/?text=${text}`)
  }

  return (
    <>
      <button
        onClick={() => setShowShareModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <FiShare2 />
        Partager
      </button>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Partager "{listName}"
            </h3>

            <div className="space-y-4">
              {/* Lien de partage */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generateShareLink()}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Copier le lien"
                >
                  <FiCopy />
                </button>
              </div>

              {/* Options de partage */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleEmailShare}
                  className="flex flex-col items-center gap-2 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiMail className="w-6 h-6" />
                  <span className="text-sm">Email</span>
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex flex-col items-center gap-2 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiMessageSquare className="w-6 h-6" />
                  <span className="text-sm">WhatsApp</span>
                </button>
              </div>

              {/* Informations */}
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {locations.length} lieu{locations.length > 1 ? 'x' : ''} dans cette liste
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 