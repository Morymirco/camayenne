'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiMapPin, FiInfo, FiPhone, FiClock, FiTag } from 'react-icons/fi'
import dynamic from 'next/dynamic'
import { use } from 'react'
import { useAlert } from '@/app/contexts/AlertContext'

const LocationPicker = dynamic(() => import('../../../../components/admin/LocationPicker'), {
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

export default function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    type: '',
    description: '',
    address: '',
    phone: '',
    openingHours: '',
    latitude: 0,
    longitude: 0
  })
  const [error, setError] = useState('')
  const { showAlert } = useAlert()

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

  useEffect(() => {
    const fetchLocation = () => {
      const storedLocations = localStorage.getItem('locations')
      if (storedLocations) {
        const locations = JSON.parse(storedLocations)
        const location = locations.find((loc: LocationFormData & { id: number }) => 
          loc.id === parseInt(resolvedParams.id)
        )
        if (location) {
          setFormData(location)
        } else {
          router.push('/admin')
        }
      }
    }

    fetchLocation()
  }, [resolvedParams.id, router])

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const storedLocations = localStorage.getItem('locations')
      if (storedLocations) {
        const locations = JSON.parse(storedLocations)
        const updatedLocations = locations.map((loc: LocationFormData & { id: number }) => 
          loc.id === parseInt(resolvedParams.id) ? { ...formData, id: parseInt(resolvedParams.id) } : loc
        )
        localStorage.setItem('locations', JSON.stringify(updatedLocations))
        showAlert('Modifications enregistrées avec succès', 'success')
        router.push('/admin')
      }
    } catch (error) {
      showAlert('Erreur lors de la modification du lieu', 'error')
      console.error('Erreur:', error)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Modifier {formData.name}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Même formulaire que la page new avec les valeurs pré-remplies */}
        {/* ... Copier le contenu du formulaire de la page new ... */}
      </form>
    </div>
  )
} 