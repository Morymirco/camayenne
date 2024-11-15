'use client'

import { useState } from 'react'
import { FiStar, FiHeart, FiMessageSquare } from 'react-icons/fi'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import type { Comment, Location } from '@/app/types/location'

type LocationReviewsProps = {
  location: Location;
  onUpdate: (updatedLocation: Location) => void;
}

export default function LocationReviews({ location, onUpdate }: LocationReviewsProps) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [newComment, setNewComment] = useState('')
  const [newRating, setNewRating] = useState(5)
  const [showCommentForm, setShowCommentForm] = useState(false)

  const isFavorite = user && location.favorites?.includes(user.id)

  const handleAddComment = () => {
    if (!user) {
      showAlert('Veuillez vous connecter pour laisser un commentaire', 'warning')
      return
    }

    if (!newComment.trim()) {
      showAlert('Veuillez écrire un commentaire', 'warning')
      return
    }

    const comment: Comment = {
      id: Date.now(),
      userId: user.id,
      locationId: location.id,
      text: newComment,
      rating: newRating,
      createdAt: new Date().toISOString(),
      userName: user.name
    }

    const updatedLocation = {
      ...location,
      comments: [...(location.comments || []), comment],
      rating: calculateAverageRating([...(location.comments || []), comment])
    }

    // Sauvegarder dans le localStorage
    const locations = JSON.parse(localStorage.getItem('locations') || '[]')
    const updatedLocations = locations.map((loc: Location) => 
      loc.id === location.id ? updatedLocation : loc
    )
    localStorage.setItem('locations', JSON.stringify(updatedLocations))

    onUpdate(updatedLocation)
    setNewComment('')
    setNewRating(5)
    setShowCommentForm(false)
    showAlert('Commentaire ajouté avec succès', 'success')
  }

  const handleToggleFavorite = () => {
    if (!user) {
      showAlert('Veuillez vous connecter pour ajouter aux favoris', 'warning')
      return
    }

    const updatedFavorites = location.favorites?.includes(user.id)
      ? location.favorites.filter(id => id !== user.id)
      : [...(location.favorites || []), user.id]

    const updatedLocation = {
      ...location,
      favorites: updatedFavorites
    }

    // Sauvegarder dans le localStorage
    const locations = JSON.parse(localStorage.getItem('locations') || '[]')
    const updatedLocations = locations.map((loc: Location) => 
      loc.id === location.id ? updatedLocation : loc
    )
    localStorage.setItem('locations', JSON.stringify(updatedLocations))

    onUpdate(updatedLocation)
    showAlert(
      isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris',
      'success'
    )
  }

  const calculateAverageRating = (comments: Comment[]) => {
    if (!comments.length) return 0
    const sum = comments.reduce((acc, comment) => acc + comment.rating, 0)
    return Math.round((sum / comments.length) * 10) / 10
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">
              {location.rating?.toFixed(1) || '0.0'}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-5 h-5 ${
                    (location.rating || 0) >= star
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-sm text-gray-500">
            ({location.comments?.length || 0} avis)
          </span>
        </div>
        <button
          onClick={handleToggleFavorite}
          className={`p-2 rounded-full transition-colors ${
            isFavorite
              ? 'text-red-500 hover:bg-red-50'
              : 'text-gray-400 hover:bg-gray-50'
          }`}
        >
          <FiHeart className={isFavorite ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Formulaire de commentaire */}
      <div className="space-y-4">
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
        >
          <FiMessageSquare />
          Laisser un avis
        </button>

        {showCommentForm && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={`p-1 ${
                    newRating >= star
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  <FiStar className={newRating >= star ? 'fill-current' : ''} />
                </button>
              ))}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCommentForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Publier
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {location.comments?.map((comment) => (
          <div
            key={comment.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{comment.userName}</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-4 h-4 ${
                          comment.rating >= star
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 