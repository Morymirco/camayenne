'use client'

import { useAlert } from '@/app/contexts/AlertContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { useState } from 'react'

type SuggestionFormProps = {
  locationId?: string
  onClose: () => void
}

export default function SuggestionForm({ locationId, onClose }: SuggestionFormProps) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [formData, setFormData] = useState({
    type: 'new_location',
    title: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      showAlert('Veuillez vous connecter pour envoyer une suggestion', 'warning')
      return
    }

  //   try {
  //     await addSuggestion({
  //       userId: user.uid,
  //       locationId,
  //       ...formData
  //     })
  //     showAlert('Suggestion envoyée avec succès', 'success')
  //     onClose()
  //   } catch (error) {
  //     console.error('Erreur lors de l\'envoi de la suggestion:', error)
  //     showAlert('Erreur lors de l\'envoi de la suggestion', 'error')
  //   }
  // }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Faire une suggestion
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de suggestion
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="new_location">Nouveau lieu</option>
            <option value="update_info">Mise à jour d'informations</option>
            <option value="report_issue">Signaler un problème</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Titre
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            rows={4}
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  )
}}