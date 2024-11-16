'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiMapPin, FiImage, FiInfo, FiPhone, FiClock, FiTag, FiUpload, FiX } from 'react-icons/fi'
import dynamic from 'next/dynamic'
import { addLocation } from '@/app/services/firebase/locations'
import { useAlert } from '@/app/contexts/AlertContext'

const LocationPicker = dynamic(() => import('../../../components/admin/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  )
})

type LocationFormData = {
  name: string
  type: string
  description: string
  address: string
  phone: string
  openingHours: string
  latitude: number
  longitude: number
}

export default function NewLocationPage() {
  const router = useRouter()
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    type: '',
    description: '',
    address: '',
    phone: '',
    openingHours: '',
    latitude: 9.5370,
    longitude: -13.6785
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const locationTypes = [
    'restaurant',
    'hotel',
    'pharmacie',
    'école',
    'banque',
    'magasin',
    'café',
    'hôpital',
    'autre'
  ]

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng })
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
    }
  }

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setGalleryImages(prev => [...prev, ...files])
    
    // Créer les URLs de prévisualisation
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setGalleryPreviews(prev => [...prev, ...newPreviews])
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => {
      // Libérer l'URL de prévisualisation
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Ajouter le lieu avec l'image de couverture et la galerie
      const newLocation = await addLocation(formData, coverImage, galleryImages)
      showAlert('Lieu ajouté avec succès !', 'success')
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error)
      showAlert(error.message || 'Une erreur est survenue', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Nettoyer les URLs de prévisualisation au démontage
  useEffect(() => {
    return () => {
      galleryPreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Ajouter un nouveau lieu
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom du lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiInfo className="inline mr-2" />
              Nom du lieu
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Type de lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiTag className="inline mr-2" />
              Type de lieu
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Sélectionner un type</option>
              {locationTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Image de couverture */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiImage className="inline mr-2" />
              Image de couverture
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <FiUpload className="mx-auto h-12 w-12" />
                </div>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                    <span>Télécharger une image de couverture</span>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                {coverImage && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Image sélectionnée: {coverImage.name}
                    </p>
                    <div className="mt-2 relative h-32 w-full">
                      <img
                        src={URL.createObjectURL(coverImage)}
                        alt="Prévisualisation"
                        className="h-full w-auto mx-auto object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Galerie d'images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiImage className="inline mr-2" />
              Galerie d'images
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <FiUpload className="mx-auto h-12 w-12" />
                </div>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                    <span>Ajouter des images à la galerie</span>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Prévisualisation de la galerie */}
            {galleryPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Image ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiMapPin className="inline mr-2" />
              Adresse
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiPhone className="inline mr-2" />
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Horaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiClock className="inline mr-2" />
              Horaires d'ouverture
            </label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ex: Lun-Ven 9h-18h"
              required
            />
          </div>
        </div>

        {/* Carte */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sélectionner l'emplacement sur la carte
          </label>
          <div className="h-[400px] rounded-lg overflow-hidden">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={[formData.latitude, formData.longitude]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">
                Latitude
              </label>
              <input
                type="number"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                step="any"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">
                Longitude
              </label>
              <input
                type="number"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                step="any"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {loading ? 'Ajout en cours...' : 'Ajouter le lieu'}
          </button>
        </div>
      </form>
    </div>
  )
} 