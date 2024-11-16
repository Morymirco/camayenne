'use client'

import { useState, useEffect } from 'react'
import { FiShare2, FiList, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import ShareList from './ShareList'
import type { Location } from '@/app/types/location'

type SavedList = {
  id: string;
  name: string;
  locations: Location[];
  createdAt: string;
  userId: string;
}

export default function SharedLists() {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [lists, setLists] = useState<SavedList[]>([])
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [newListName, setNewListName] = useState('')

  useEffect(() => {
    // Charger les listes sauvegardées
    const savedLists = localStorage.getItem('savedLists')
    if (savedLists) {
      const parsedLists = JSON.parse(savedLists)
      // Filtrer les listes de l'utilisateur connecté
      const userLists = user ? parsedLists.filter((list: SavedList) => list.userId === user.id) : []
      setLists(userLists)
    }
  }, [user])

  const handleCreateList = () => {
    if (!user) {
      showAlert('Veuillez vous connecter pour créer une liste', 'warning')
      return
    }

    if (!newListName.trim()) {
      showAlert('Veuillez donner un nom à votre liste', 'warning')
      return
    }

    const newList: SavedList = {
      id: Date.now().toString(),
      name: newListName,
      locations: [],
      createdAt: new Date().toISOString(),
      userId: user.id
    }

    const updatedLists = [...lists, newList]
    setLists(updatedLists)
    localStorage.setItem('savedLists', JSON.stringify(updatedLists))
    setNewListName('')
    setShowNewListForm(false)
    showAlert('Liste créée avec succès', 'success')
  }

  const handleDeleteList = (listId: string) => {
    const updatedLists = lists.filter(list => list.id !== listId)
    setLists(updatedLists)
    localStorage.setItem('savedLists', JSON.stringify(updatedLists))
    showAlert('Liste supprimée', 'success')
  }

  const handleAddToList = (listId: string, location: Location) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        // Vérifier si le lieu n'est pas déjà dans la liste
        if (!list.locations.some(loc => loc.id === location.id)) {
          return {
            ...list,
            locations: [...list.locations, location]
          }
        }
      }
      return list
    })

    setLists(updatedLists)
    localStorage.setItem('savedLists', JSON.stringify(updatedLists))
    showAlert('Lieu ajouté à la liste', 'success')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mes listes
        </h2>
        <button
          onClick={() => setShowNewListForm(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <FiPlus className="w-5 h-5" />
        </button>
      </div>

      {showNewListForm && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Nom de la liste"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNewListForm(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateList}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Créer
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {lists.map((list) => (
          <div
            key={list.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {list.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {list.locations.length} lieu{list.locations.length !== 1 && 'x'}
                </p>
              </div>
              <div className="flex gap-2">
                <ShareList locations={list.locations} listName={list.name} />
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {list.locations.length > 0 ? (
              <div className="mt-4 space-y-2">
                {list.locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {location.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {location.type}
                    </span>
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