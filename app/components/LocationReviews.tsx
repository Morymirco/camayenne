'use client'

import { useState } from 'react'
import { FiStar, FiUser, FiThumbsUp, FiThumbsDown, FiFlag } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import type { Comment } from '@/app/types/location'

type LocationReviewsProps = {
  locationId: string
  comments: Comment[]
  onAddComment: (comment: Omit<Comment, 'id'>) => Promise<void>
}

export default function LocationReviews({ locationId, comments, onAddComment }: LocationReviewsProps) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async () => {
    if (!user) {
      showAlert('Veuillez vous connecter pour laisser un avis', 'warning')
      return
    }

    if (rating === 0) {
      showAlert('Veuillez donner une note', 'warning')
      return
    }

    if (!comment.trim()) {
      showAlert('Veuillez écrire un commentaire', 'warning')
      return
    }

    try {
      await onAddComment({
        userId: user.uid,
        userName: user.displayName || 'Anonyme',
        // locationId,
        text: comment,
        rating,
        createdAt: new Date().toISOString()
      })

      setShowReviewForm(false)
      setRating(0)
      setComment('')
      showAlert('Avis ajouté avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error)
      showAlert('Erreur lors de l\'ajout de l\'avis', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Avis ({comments.length})
        </h3>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Donner mon avis
        </button>
      </div>

      {/* Formulaire d'avis */}
      {showReviewForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none transition-transform hover:scale-110"
                >
                  {star <= (hoveredRating || rating) ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FiStar className="text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {rating} sur 5
            </span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            rows={4}
          />

          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Publier
            </button>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      <div className="space-y-4">
        {comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((comment) => (
          <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <FiUser className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {comment.userName}
                  </p>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < comment.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FiThumbsUp className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FiThumbsDown className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-red-500">
                  <FiFlag className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{comment.text}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Aucun avis pour le moment. Soyez le premier à donner votre avis !
          </p>
        )}
      </div>
    </div>
  )
} 