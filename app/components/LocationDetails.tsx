'use client'

import { FiMapPin, FiPhone, FiClock, FiX, FiStar, FiShare2, FiPlus, FiChevronLeft, FiChevronRight, FiMaximize, FiHeart, FiImage } from 'react-icons/fi'
import { FiStar as FiStarOutline } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa'
import Image from 'next/image'
import { Location } from '@/app/types/location'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import { useState } from 'react'
import { addComment, updateLocation } from '@/app/services/firebase/locations'

type LocationDetailsProps = {
  location: Location
  onClose: () => void
}

// Images de démonstration depuis Unsplash
const defaultImages = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',  // Restaurant
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',  // Hôtel
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',  // Pharmacie
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',  // École
]

const getDefaultImage = (type: string): string => {
  switch(type.toLowerCase()) {
    case 'restaurant':
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
    case 'hotel':
      return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'
    case 'pharmacie':
      return 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800'
    case 'école':
      return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800'
    case 'banque':
      return 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800'
    case 'magasin':
      return 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'
    case 'café':
      return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800'
    case 'hôpital':
      return 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800'
    default:
      return 'https://images.unsplash.com/photo-1604357209793-fca5dca89f97?w=800'
  }
}

export default function LocationDetails({ location, onClose }: LocationDetailsProps) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [showGallery, setShowGallery] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleShare = async () => {
    try {
      const shareData = {
        title: location.name,
        text: `Découvrez ${location.name} sur notre carte !`,
        url: `${window.location.origin}/location/${location.id}`
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        showAlert('Lien copié dans le presse-papier !', 'success')
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error)
      showAlert('Erreur lors du partage', 'error')
    }
  }

  const handleAddReview = async () => {
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
      await addComment(location.id, {
        userId: user.uid,
        userName: user.displayName || 'Anonyme',
        text: comment,
        rating,
        createdAt: new Date().toISOString()
      })

      // Mettre à jour la note moyenne
      const newRating = location.comments 
        ? ((location.rating || 0) * location.comments.length + rating) / (location.comments.length + 1)
        : rating

      await updateLocation(location.id, {
        ...location,
        rating: newRating
      })

      showAlert('Avis ajouté avec succès', 'success')
      setShowReviewForm(false)
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error)
      showAlert('Erreur lors de l\'ajout de l\'avis', 'error')
    }
  }

  // Utiliser l'image du lieu ou une image par défaut basée sur le type
  const mainImage = location.image || getDefaultImage(location.type)
  
  // Créer un tableau d'images incluant l'image principale et les images de démonstration
  const images = [
    mainImage,
    ...defaultImages.filter(img => img !== mainImage)
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide relative"
        onClick={e => e.stopPropagation()}
      >
        {/* En-tête avec image */}
        <div className="relative h-64 w-full">
          <Image
            src={mainImage}
            alt={location.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
          
          {/* Boutons d'action en haut */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <FiShare2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Informations principales superposées sur l'image */}
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold mb-1 drop-shadow-lg">
              {location.name}
            </h2>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-sm">
                {location.type}
              </span>
              <div className="flex items-center bg-yellow-500/80 backdrop-blur-sm px-2 py-1 rounded-full">
                <FiStar className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">
                  {location.rating?.toFixed(1) || '4.5'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {location.description}
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <FiMapPin className="w-5 h-5 mr-3 text-blue-500" />
              <span>{location.address}</span>
            </div>

            {location.phone && (
              <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <FiPhone className="w-5 h-5 mr-3 text-green-500" />
                <span>{location.phone}</span>
              </div>
            )}

            {location.openingHours && (
              <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <FiClock className="w-5 h-5 mr-3 text-purple-500" />
                <span>{location.openingHours}</span>
              </div>
            )}
          </div>

          {/* Galerie photos */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiImage className="mr-2" />
              Galerie photos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setCurrentImageIndex(index)
                    setShowGallery(true)
                  }}
                >
                  <Image
                    src={image}
                    alt={`${location.name} - Image ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity" />
                  <FiMaximize 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section des avis */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Avis ({location.comments?.length || 0})
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
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="text-2xl focus:outline-none"
                      >
                        {star <= (hoveredRating || rating) ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FiStarOutline className="text-yellow-400" />
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
                    onClick={handleAddReview}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Publier
                  </button>
                </div>
              </div>
            )}

            {/* Liste des commentaires */}
            <div className="space-y-4">
              {location.comments?.map((comment, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {comment.userName}
                      </p>
                      <div className="flex items-center">
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
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                </div>
              ))}

              {(!location.comments || location.comments.length === 0) && (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Aucun avis pour le moment
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal galerie plein écran */}
      {showGallery && (
        <div 
          className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
          onClick={() => setShowGallery(false)}
        >
          {/* Navigation */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <FiChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrentImageIndex((prev) => (prev + 1) % images.length)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <FiChevronRight className="w-8 h-8" />
          </button>

          {/* Bouton fermer */}
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <FiX className="w-8 h-8" />
          </button>

          {/* Image courante */}
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={images[currentImageIndex]}
                alt={`${location.name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                quality={100}
                priority
              />
            </div>
            
            {/* Compteur d'images */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 