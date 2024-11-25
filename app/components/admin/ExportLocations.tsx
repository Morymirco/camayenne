'use client'

import { useState } from 'react'
import { FiDownload } from 'react-icons/fi'
import { getLocations } from '@/app/services/firebase/locations'

export default function ExportLocations() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      // Récupérer tous les lieux
      const locations = await getLocations()
      
      // Créer le fichier JSON
      const jsonString = JSON.stringify(locations, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Créer un lien de téléchargement
      const link = document.createElement('a')
      link.href = url
      link.download = `locations_export_${new Date().toISOString().split('T')[0]}.json`
      
      // Déclencher le téléchargement
      document.body.appendChild(link)
      link.click()
      
      // Nettoyer
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
    >
      <FiDownload className="mr-2" />
      {isExporting ? 'Export en cours...' : 'Exporter les lieux'}
    </button>
  )
} 