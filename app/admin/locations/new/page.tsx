'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiMapPin, FiImage, FiInfo, FiPhone, FiClock, FiTag } from 'react-icons/fi'
import dynamic from 'next/dynamic'

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
  const [error, setError] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Récupérer les lieux existants
      const existingLocationsStr = localStorage.getItem('locations')
      const existingLocations = existingLocationsStr ? JSON.parse(existingLocationsStr) : []
      
      // Ajouter le nouveau lieu
      const newLocation = {
        ...formData,
        id: Date.now(), // Générer un ID unique
        createdAt: new Date().toISOString()
      }
      
      const updatedLocations = [...existingLocations, newLocation]
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('locations', JSON.stringify(updatedLocations))
      
      // Rediriger vers la liste des lieux
      router.push('/admin')
    } catch (error) {
      setError('Erreur lors de l\'ajout du lieu')
      console.error('Erreur:', error)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Ajouter un nouveau lieu
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Carte pour sélectionner l'emplacement */}
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Ajouter le lieu
          </button>
        </div>
      </form>
    </div>
  )
} 