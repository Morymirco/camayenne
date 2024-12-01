'use client'

import { useAlert } from '@/app/contexts/AlertContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { addLocationToList, getUserLists, SavedList } from '@/app/services/firebase/lists'
import { getLocations } from '@/app/services/firebase/locations'
import type { Location } from '@/app/types/location'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { FiClock, FiHeart, FiMapPin, FiPhone, FiPlus, FiStar, FiMap } from 'react-icons/fi'
import LocationDetails from './LocationDetails'

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

export default function LocationList() {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [showListSelector, setShowListSelector] = useState(false)
  const [userLists, setUserLists] = useState<SavedList[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const carouselInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const fetchedLocations = await getLocations()
        setLocations(fetchedLocations)
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error)
        showAlert('Erreur lors du chargement des lieux', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    // Charger les favoris de l'utilisateur
    const loadFavorites = () => {
      if (user) {
        const storedFavorites = localStorage.getItem(`favorites_${user.uid}`)
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites))
        }
      }
    }

    loadLocations()
    loadFavorites()
  }, [user, showAlert])

  // Charger les listes de l'utilisateur
  useEffect(() => {
    const loadUserLists = async () => {
      if (!user) return
      try {
        const lists = await getUserLists(user.uid)
        setUserLists(lists)
      } catch (error) {
        console.error('Erreur lors du chargement des listes:', error)
      }
    }
    loadUserLists()
  }, [user])

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location)
    window.dispatchEvent(new CustomEvent('centerOnLocation', {
      detail: { lat: location.latitude, lng: location.longitude }
    }))
  }

  const toggleFavorite = (locationId: string) => {
    if (!user) {
      showAlert('Veuillez vous connecter pour ajouter aux favoris', 'warning')
      return
    }

    const newFavorites = favorites.includes(locationId)
      ? favorites.filter(id => id !== locationId)
      : [...favorites, locationId]

    setFavorites(newFavorites)
    localStorage.setItem(`favorites_${user.uid}`, JSON.stringify(newFavorites))
    
    showAlert(
      favorites.includes(locationId) ? 'Retiré des favoris' : 'Ajouté aux favoris',
      'success'
    )
  }

  const handleAddToList = async (location: Location) => {
    if (!user) {
      showAlert('Veuillez vous connecter pour ajouter à une liste', 'warning')
      return
    }
    setShowListSelector(true)
  }

  const handleListSelect = async (listId: string, location: Location) => {
    try {
      await addLocationToList(listId, location)
      showAlert('Lieu ajouté à la liste avec succès', 'success')
      setShowListSelector(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste:', error)
      showAlert('Erreur lors de l\'ajout à la liste', 'error')
    }
  }

  // Fonction pour obtenir les images d'un lieu
  const getLocationImages = (location: Location) => {
    const mainImage = location.image || getDefaultImage(location.type)
    return [mainImage, ...defaultImages.filter(img => img !== mainImage)]
  }

  // Gérer le début du survol
  const handleMouseEnter = (locationId: string) => {
    setHoveredLocation(locationId)
    setCurrentImageIndex(0)
    
    // Démarrer le carousel
    carouselInterval.current = setInterval(() => {
      setCurrentImageIndex(prev => {
        const images = getLocationImages(locations.find(l => l.id === locationId)!)
        return (prev + 1) % images.length
      })
    }, 2000) // Change l'image toutes les 2 secondes
  }

  // Gérer la fin du survol
  const handleMouseLeave = () => {
    setHoveredLocation(null)
    setCurrentImageIndex(0)
    if (carouselInterval.current) {
      clearInterval(carouselInterval.current)
    }
  }

  // Nettoyer l'intervalle au démontage
  useEffect(() => {
    return () => {
      if (carouselInterval.current) {
        clearInterval(carouselInterval.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
        Aucun lieu disponible
      </div>
    )
  }

  return (
    <div className="space-y-4 p-2 h-[calc(100vh-220px)] overflow-y-auto scrollbar-hide">
      {locations.map((location) => (
        <div 
          key={location.id}
          onClick={() => handleLocationClick(location)}
          onMouseEnter={() => handleMouseEnter(location.id)}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer"
        >
          {/* Image et badge de type */}
          <div className="relative h-36">
            <div className="relative w-full h-full overflow-hidden">
              {getLocationImages(location).map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`${location.name} - Image ${index + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-500 absolute inset-0
                    ${hoveredLocation === location.id && currentImageIndex === index
                      ? 'opacity-100'
                      : 'opacity-0'
                    }
                    ${hoveredLocation !== location.id && index === 0 ? 'opacity-100' : ''}
                  `}
                />
              ))}
            </div>

            {/* Indicateurs de carousel */}
            {hoveredLocation === location.id && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {getLocationImages(location).map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 
                      ${currentImageIndex === index 
                        ? 'bg-white' 
                        : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            )}

            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                {location.type}
              </span>
            </div>
            {/* Bouton favori */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(location.id)
              }}
              className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm transition-colors ${
                favorites.includes(location.id)
                  ? 'text-red-500 hover:bg-white/90'
                  : 'text-gray-600 hover:bg-white/90'
              }`}
            >
              <FiHeart
                className={`w-4 h-4 ${favorites.includes(location.id) ? 'fill-current' : ''}`}
              />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
                {location.name}
              </h3>
              <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded">
                <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="ml-0.5 text-xs text-yellow-700 dark:text-yellow-500">
                  {location.rating?.toFixed(1) || '4.5'}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
              {location.description}
            </p>

            <div className="space-y-1 text-xs mb-3">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <FiMapPin className="w-3 h-3 mr-1 flex-shrink-0 text-gray-400" />
                <span className="line-clamp-1">{location.address}</span>
              </div>

              {location.phone && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FiPhone className="w-3 h-3 mr-1 flex-shrink-0 text-gray-400" />
                  <span>{location.phone}</span>
                </div>
              )}

              {location.openingHours && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FiClock className="w-3 h-3 mr-1 flex-shrink-0 text-gray-400" />
                  <span>{location.openingHours}</span>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('centerOnLocation', {
                    detail: {
                      lat: location.latitude,
                      lng: location.longitude
                    }
                  }))
                }}
                className="flex items-center px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <FiMap className="w-4 h-4 mr-1" />
                Voir sur la carte
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToList(location)
                }}
                className="flex-1 flex items-center justify-center px-2 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <FiPlus className="w-3 h-3 mr-1" />
                Ajouter à une liste
              </button>
            </div>
          </div>

          {/* Modal de sélection de liste */}
          {showListSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Choisir une liste
                </h3>
                
                {userLists.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userLists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => handleListSelect(list.id, location)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{list.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {list.locations.length} lieu(x)
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
                    Vous n'avez pas encore créé de liste
                  </p>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowListSelector(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setShowListSelector(false)
                      // Rediriger vers la création de liste si nécessaire
                      if (userLists.length === 0) {
                        // Vous pouvez ajouter une redirection ici
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {userLists.length === 0 ? 'Créer une liste' : 'Fermer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Modal des détails */}
      {selectedLocation && (
        <LocationDetails
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  )
} 