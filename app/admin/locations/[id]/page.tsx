'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiMapPin, FiPhone, FiClock, FiEdit2, FiTrash2, FiStar, FiMessageSquare, FiArrowLeft, FiImage, FiX } from 'react-icons/fi'
import { getLocationById, deleteLocation } from '@/app/services/firebase/locations'
import { useAlert } from '@/app/contexts/AlertContext'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import type { Location } from '@/app/types/location'

const LocationPicker = dynamic(() => import('@/app/components/admin/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
})

export default function LocationDetailPage({ params }: { params: { id: string } }) {
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const router = useRouter()
  const { showAlert } = useAlert()

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const data = await getLocationById(params.id)
        if (data) {
          setLocation(data)
        } else {
          showAlert('Lieu non trouvé', 'error')
          router.push('/admin')
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        showAlert('Erreur lors du chargement du lieu', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadLocation()
  }, [params.id, router, showAlert])

  const handleDelete = async () => {
    try {
      await deleteLocation(params.id)
      showAlert('Lieu supprimé avec succès', 'success')
      router.push('/admin')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showAlert('Erreur lors de la suppression', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!location) return null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/admin/locations/${params.id}/edit`)}
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

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image et informations de base */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-64">
              <Image
                src={location.image || '/placeholder.jpg'}
                alt={location.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {location.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm">
                  {location.type}
                </span>
                {location.rating && (
                  <div className="flex items-center">
                    <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {location.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {location.description}
              </p>
            </div>
          </div>

          {/* Carte */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
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
          </div>

          {/* Après la section carte, ajoutez la galerie */}
          {location.gallery && location.gallery.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiImage className="mr-2" />
                Galerie ({location.gallery.length} images)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {location.gallery.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image
                      src={imageUrl}
                      alt={`${location.name} - Image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <button
                        onClick={() => setSelectedImage(imageUrl)}
                        className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                      >
                        Voir l'image
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ajouter un message si pas d'images */}
          {(!location.gallery || location.gallery.length === 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiImage className="mr-2" />
                Galerie
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Aucune image dans la galerie
              </p>
            </div>
          )}
        </div>

        {/* Colonne de droite */}
        <div className="space-y-6">
          {/* Informations de contact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations de contact
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <FiMapPin className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-400">{location.address}</span>
              </div>
              {location.phone && (
                <div className="flex items-center">
                  <FiPhone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">{location.phone}</span>
                </div>
              )}
              {location.openingHours && (
                <div className="flex items-center">
                  <FiClock className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">{location.openingHours}</span>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistiques
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avis</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {location.comments?.length || 0}
                    </h3>
                  </div>
                  <FiMessageSquare className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Note</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {location.rating?.toFixed(1) || '-'}
                    </h3>
                  </div>
                  <FiStar className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Coordonnées GPS */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Coordonnées GPS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Latitude</p>
                <p className="text-gray-900 dark:text-white font-mono">
                  {location.latitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Longitude</p>
                <p className="text-gray-900 dark:text-white font-mono">
                  {location.longitude.toFixed(6)}
                </p>
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
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'affichage d'image */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl w-full max-h-[90vh] aspect-auto">
            <Image
              src={selectedImage}
              alt="Image en plein écran"
              fill
              className="object-contain"
              quality={100}
              priority
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 