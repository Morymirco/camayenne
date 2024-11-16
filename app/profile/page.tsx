'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiCamera, FiMapPin, FiList, FiHeart, FiStar, FiArrowLeft } from 'react-icons/fi'
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db, storage } from '@/app/services/firebase/config'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import Image from 'next/image'
import type { UserProfile, UserStats } from '@/app/types/user'
import type { SavedList } from '@/app/services/firebase/lists'
import { useRouter } from 'next/navigation'
import UserMessages from '@/app/components/UserMessages'
import EditProfileForm from '@/app/components/EditProfileForm'

export default function ProfilePage() {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState<UserProfile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    totalLists: 0,
    totalFavorites: 0,
    totalReviews: 0,
    averageRating: 0
  })
  const [recentActivity, setRecentActivity] = useState<{
    lists: SavedList[]
    favorites: Location[]
    reviews: any[]
  }>({
    lists: [],
    favorites: [],
    reviews: []
  })
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile
          setProfile(userData)
          setEditForm(userData)
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        showAlert('Erreur lors du chargement du profil', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, showAlert])

  // Charger les statistiques de l'utilisateur
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) return

      try {
        // Charger les listes
        const listsQuery = query(collection(db, 'lists'), where('userId', '==', user.uid))
        const listsSnap = await getDocs(listsQuery)
        
        // Charger les favoris
        const favorites = JSON.parse(localStorage.getItem(`favorites_${user.uid}`) || '[]')
        
        // Charger les avis
        const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', user.uid))
        const reviewsSnap = await getDocs(reviewsQuery)
        
        const reviews = reviewsSnap.docs.map(doc => doc.data())
        const averageRating = reviews.length > 0
          ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
          : 0

        setStats({
          totalLists: listsSnap.size,
          totalFavorites: favorites.length,
          totalReviews: reviews.length,
          averageRating
        })

        // Charger l'activité récente
        setRecentActivity({
          lists: listsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SavedList[],
          favorites: [], // À implémenter avec les données réelles
          reviews
        })
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      }
    }

    loadUserStats()
  }, [user])

  const handleSave = async () => {
    if (!user || !editForm) return

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...editForm,
        updatedAt: new Date().toISOString()
      })
      setProfile(editForm)
      setIsEditing(false)
      showAlert('Profil mis à jour avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      showAlert('Erreur lors de la mise à jour du profil', 'error')
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadingPhoto(true)
    try {
      // Supprimer l'ancienne photo si elle existe
      if (profile?.photoURL) {
        const oldPhotoRef = ref(storage, profile.photoURL)
        try {
          await deleteObject(oldPhotoRef)
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'ancienne photo:', error)
        }
      }

      // Upload de la nouvelle photo
      const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const photoURL = await getDownloadURL(snapshot.ref)

      // Mettre à jour le profil Firebase Auth
      await updateProfile(user, { photoURL })

      // Mettre à jour le profil Firestore
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { photoURL })

      // Mettre à jour l'état local
      setProfile(prev => prev ? { ...prev, photoURL } : null)
      showAlert('Photo de profil mise à jour avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo:', error)
      showAlert('Erreur lors de la mise à jour de la photo', 'error')
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Profil non trouvé</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Informations principales */}
          {isEditing ? (
            <div className="lg:col-span-3">
              <EditProfileForm
                profile={profile}
                onUpdate={() => {
                  setIsEditing(false)
                  // Recharger les données du profil
                  window.location.reload()
                }}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <>
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                  {/* En-tête avec photo de profil */}
                  <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
                    {/* Image de couverture */}
                    {profile.coverURL && (
                      <Image
                        src={profile.coverURL}
                        alt="Couverture"
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute -bottom-12 left-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700">
                          {profile?.photoURL ? (
                            <Image
                              src={profile.photoURL}
                              alt="Photo de profil"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                              <FiUser />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handlePhotoClick}
                          disabled={uploadingPhoto}
                          className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
                        >
                          <FiCamera className="w-4 h-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informations du profil */}
                  <div className="pt-16 px-6 pb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {profile.firstName} {profile.lastName}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Membre depuis {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Bio */}
                    <div className="mt-6">
                      <p className="text-gray-600 dark:text-gray-300">
                        {profile.bio || 'Aucune bio renseignée'}
                      </p>
                    </div>

                    {/* Statistiques */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Listes</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLists}</p>
                          </div>
                          <FiList className="w-8 h-8 text-blue-500" />
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Favoris</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFavorites}</p>
                          </div>
                          <FiHeart className="w-8 h-8 text-red-500" />
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Avis</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReviews}</p>
                          </div>
                          <FiStar className="w-8 h-8 text-yellow-500" />
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Note moyenne</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {stats.averageRating.toFixed(1)}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <FiStar className="w-8 h-8 text-yellow-500 fill-current" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <FiMail className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{profile?.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <FiPhone className="w-5 h-5 mr-3 text-gray-400" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile?.address && (
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <FiMapPin className="w-5 h-5 mr-3 text-gray-400" />
                          <span>{profile.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne de droite - Activité récente et Messages */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Listes récentes */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Listes récentes
                    </h2>
                    <div className="space-y-4">
                      {recentActivity.lists.slice(0, 3).map((list) => (
                        <div key={list.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{list.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {list.locations.length} lieu(x)
                            </p>
                          </div>
                          <FiList className="w-5 h-5 text-blue-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Avis récents */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Derniers avis
                    </h2>
                    <div className="space-y-4">
                      {recentActivity.reviews.slice(0, 3).map((review, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {review.locationName}
                            </h3>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{review.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Messages */}
                  <UserMessages />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 