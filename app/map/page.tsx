'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MapComponent from '../components/MapComponent'
import Sidebar from '../components/Sidebar'
import { getLocationById } from '../services/firebase/locations'

export default function MapPage() {
  const searchParams = useSearchParams()
  const locationId = searchParams.get('locationId')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  useEffect(() => {
    const showSharedLocation = async () => {
      if (locationId && lat && lng) {
        try {
          const location = await getLocationById(locationId)
          if (location) {
            // Émettre un événement pour centrer la carte et afficher les détails
            window.dispatchEvent(new CustomEvent('centerOnLocation', {
              detail: { lat: parseFloat(lat), lng: parseFloat(lng) }
            }))
            window.dispatchEvent(new CustomEvent('showLocationDetails', {
              detail: location
            }))
          }
        } catch (error) {
          console.error('Erreur lors du chargement du lieu partagé:', error)
        }
      }
    }

    showSharedLocation()
  }, [locationId, lat, lng])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 relative">
        <MapComponent />
      </div>
    </div>
  )
} 