'use client'

import { useState, useRef } from 'react'
import { FiUpload } from 'react-icons/fi'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/app/services/firebase/config'
import { useAlert } from '@/app/contexts/AlertContext'

export default function ImportLocations() {
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showAlert } = useAlert()

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      // Lire le fichier JSON
      const text = await file.text()
      const locations = JSON.parse(text)

      // Vérifier que c'est un tableau
      if (!Array.isArray(locations)) {
        throw new Error('Le fichier doit contenir un tableau de lieux')
      }

      // Ajouter chaque lieu à Firestore
      const locationsRef = collection(db, 'locations')
      const addPromises = locations.map(location => {
        const { id, ...locationData } = location // Exclure l'id s'il existe
        return addDoc(locationsRef, {
          ...locationData,
          createdAt: new Date().toISOString()
        })
      })

      await Promise.all(addPromises)
      showAlert(`${locations.length} lieux importés avec succès`, 'success')

      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      showAlert('Erreur lors de l\'import des lieux', 'error')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        <FiUpload className="mr-2" />
        {isImporting ? 'Import en cours...' : 'Importer des lieux'}
      </button>
    </div>
  )
} 