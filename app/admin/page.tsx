'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '../components/admin/AdminHeader'
import LocationsList from '../components/admin/LocationsList'
import ImportExportLocations from '../components/admin/ImportExportLocations'
import type { Location } from '@/app/types/location'

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
      if (storedLocations) {
        const data = JSON.parse(storedLocations)
        // Convertir les IDs en string si nécessaire
        const formattedData = data.map((loc: any) => ({
          ...loc,
          id: loc.id.toString()
        }))
        setLocations(formattedData)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error)
      setIsLoading(false)
    }
  }

  const handleImport = (importedLocations: Location[]) => {
    // S'assurer que les IDs sont des strings
    const formattedLocations = importedLocations.map(loc => ({
      ...loc,
      id: loc.id.toString()
    }))
    setLocations(formattedLocations)
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