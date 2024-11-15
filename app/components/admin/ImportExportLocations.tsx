'use client'

import { useState } from 'react'
import { FiUpload, FiDownload, FiAlertCircle } from 'react-icons/fi'

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

type ImportExportProps = {
  locations: Location[]
  onImport: (locations: Location[]) => void
}

export default function ImportExportLocations({ locations, onImport }: ImportExportProps) {
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(locations, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `locations_${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      setSuccess('Export réussi !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'export')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)
        
        // Validation basique
        if (!Array.isArray(importedData)) {
          throw new Error('Le fichier doit contenir un tableau de lieux')
        }

        // Validation de la structure des données
        const isValidLocation = (loc: any): loc is Location => {
          return typeof loc.name === 'string' &&
                 typeof loc.type === 'string' &&
                 typeof loc.latitude === 'number' &&
                 typeof loc.longitude === 'number'
        }

        if (!importedData.every(isValidLocation)) {
          throw new Error('Structure de données invalide')
        }

        onImport(importedData)
        setSuccess('Import réussi !')
        setTimeout(() => setSuccess(''), 3000)
      } catch (err) {
        setError('Erreur lors de l\'import : fichier invalide')
        setTimeout(() => setError(''), 3000)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Import / Export
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Import */}
        <div className="flex-1">
          <label className="relative flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer group">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="sr-only"
            />
            <div className="text-center">
              <FiUpload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500" />
              <span className="mt-2 block text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-500">
                Importer des lieux
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                JSON uniquement
              </span>
            </div>
          </label>
        </div>

        {/* Export */}
        <div className="flex-1">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-center">
              <FiDownload className="mx-auto h-8 w-8 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Exporter les lieux
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                {locations.length} lieux
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2" />
          {success}
        </div>
      )}

      {/* Documentation */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Format attendu :</h3>
        <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
{`[
  {
    "name": "Nom du lieu",
    "type": "Type de lieu",
    "description": "Description",
    "address": "Adresse",
    "phone": "Téléphone",
    "openingHours": "Horaires",
    "latitude": 9.5370,
    "longitude": -13.6785
  }
]`}
        </pre>
      </div>
    </div>
  )
} 