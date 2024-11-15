'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '../components/admin/AdminHeader'
import LocationsList from '../components/admin/LocationsList'
import ImportExportLocations from '../components/admin/ImportExportLocations'

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
  image?: string
}

export default function AdminPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      // Charger depuis le localStorage
      const storedLocations = localStorage.getItem('locations')
      const data = storedLocations ? JSON.parse(storedLocations) : []
      setLocations(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error)
      setIsLoading(false)
    }
  }

  const handleImport = (importedLocations: Location[]) => {
    setLocations(importedLocations)
  }

  return (
    <div className="p-6">
      <AdminHeader title="Gestion des lieux" />
      <div className="space-y-6">
        <ImportExportLocations
          locations={locations}
          onImport={handleImport}
        />
        <LocationsList locations={locations} isLoading={isLoading} />
      </div>
    </div>
  )
} 