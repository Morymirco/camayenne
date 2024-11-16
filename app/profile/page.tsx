'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiCamera } from 'react-icons/fi'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, storage } from '@/app/services/firebase/config'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import Image from 'next/image'

type UserProfile = {
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
  photoURL?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState<UserProfile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

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
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* En-tête */}
          <div className="p-6 bg-blue-500 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Mon Profil</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <FiEdit2 className="mr-2" />
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-6">
            {/* Photo de profil */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                  <FiCamera className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              // Formulaire d'édition
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={editForm?.firstName}
                      onChange={(e) => setEditForm({ ...editForm!, firstName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={editForm?.lastName}
                      onChange={(e) => setEditForm({ ...editForm!, lastName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={editForm?.phone}
                    onChange={(e) => setEditForm({ ...editForm!, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              // Affichage des informations
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                    {profile.firstName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <FiPhone className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                        <p className="text-gray-900 dark:text-white">{profile.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <FiCalendar className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Membre depuis</p>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 