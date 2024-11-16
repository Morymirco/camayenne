'use client'

import { useState, useEffect } from 'react'
import { FiShare2, FiList, FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import ShareList from './ShareList'
import type { Location } from '@/app/types/location'
import { getUserLists, createList, deleteList, removeLocationFromList, SavedList } from '@/app/services/firebase/lists'

export default function SharedLists() {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [lists, setLists] = useState<SavedList[]>([])
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [newListData, setNewListData] = useState({
    name: '',
    description: '',
    isPublic: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLists = async () => {
      if (!user) {
        setLists([])
        setLoading(false)
        return
      }

      try {
        const userLists = await getUserLists(user.uid)
        setLists(userLists)
      } catch (error) {
        console.error('Erreur lors du chargement des listes:', error)
        showAlert('Erreur lors du chargement des listes', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadLists()
  }, [user, showAlert])

  const handleCreateList = async () => {
    if (!user) {
      showAlert('Veuillez vous connecter pour créer une liste', 'warning')
      return
    }

    if (!newListData.name.trim()) {
      showAlert('Veuillez donner un nom à votre liste', 'warning')
      return
    }

    try {
      const newList = await createList(user.uid, {
        name: newListData.name,
        description: newListData.description,
        isPublic: newListData.isPublic,
        locations: [],
        userId: user.uid
      })

      setLists([...lists, newList])
      setNewListData({ name: '', description: '', isPublic: false })
      setShowNewListForm(false)
      showAlert('Liste créée avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de la création de la liste:', error)
      showAlert('Erreur lors de la création de la liste', 'error')
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
      try {
        await deleteList(listId)
        setLists(lists.filter(list => list.id !== listId))
        showAlert('Liste supprimée avec succès', 'success')
      } catch (error) {
        console.error('Erreur lors de la suppression de la liste:', error)
        showAlert('Erreur lors de la suppression de la liste', 'error')
      }
    }
  }

  const handleRemoveLocation = async (listId: string, locationId: string) => {
    try {
      await removeLocationFromList(listId, locationId)
      setLists(lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            locations: list.locations.filter(loc => loc.id !== locationId)
          }
        }
        return list
      }))
      showAlert('Lieu retiré de la liste avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu:', error)
      showAlert('Erreur lors de la suppression du lieu', 'error')
    }
  }

  const handleShare = async (list: SavedList) => {
    if (!list.isPublic) {
      showAlert('Cette liste doit être publique pour être partagée', 'warning')
      return
    }

    try {
      // Créer l'URL de partage
      const shareUrl = `${window.location.origin}/shared-list/${list.id}`
      
      // Essayer d'utiliser l'API de partage si disponible
      if (navigator.share) {
        await navigator.share({
          title: `Liste: ${list.name}`,
          text: list.description || 'Découvrez cette liste de lieux !',
          url: shareUrl
        })
      } else {
        // Fallback : copier le lien dans le presse-papier
        await navigator.clipboard.writeText(shareUrl)
        showAlert('Lien copié dans le presse-papier !', 'success')
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error)
      showAlert('Erreur lors du partage de la liste', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Bouton pour créer une nouvelle liste */}
      <button
        onClick={() => setShowNewListForm(true)}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <FiPlus className="mr-2" />
        Nouvelle liste
      </button>

      {/* Formulaire de création de liste */}
      {showNewListForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow space-y-4">
          <input
            type="text"
            placeholder="Nom de la liste"
            value={newListData.name}
            onChange={(e) => setNewListData({ ...newListData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <textarea
            placeholder="Description (optionnelle)"
            value={newListData.description}
            onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newListData.isPublic}
              onChange={(e) => setNewListData({ ...newListData, isPublic: e.target.checked })}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Liste publique</span>
          </label>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowNewListForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateList}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Créer
            </button>
          </div>
        </div>
      )}

      {/* Liste des listes sauvegardées */}
      <div className="space-y-4">
        {lists.map((list) => (
          <div
            key={list.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {list.name}
                  </h3>
                  {list.isPublic && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      Public
                    </span>
                  )}
                </div>
                {list.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {list.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {list.locations.length} lieu{list.locations.length !== 1 && 'x'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare(list)}
                  className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group relative"
                  title="Partager la liste"
                >
                  <FiShare2 className="w-5 h-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Partager
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group relative"
                  title="Supprimer la liste"
                >
                  <FiTrash2 className="w-5 h-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Supprimer
                  </span>
                </button>
              </div>
            </div>

            {list.locations.length > 0 ? (
              <div className="mt-4 space-y-2">
                {list.locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {location.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {location.type}
                      </span>
                      <button
                        onClick={() => handleRemoveLocation(list.id, location.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Retirer de la liste"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Aucun lieu dans cette liste
              </p>
            )}
          </div>
        ))}

        {lists.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Vous n'avez pas encore créé de liste
          </p>
        )}
      </div>
    </div>
  )
} 