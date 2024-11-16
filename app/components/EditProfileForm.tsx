'use client'

import { useState, useRef } from 'react'
import { FiCamera, FiUser, FiMail, FiPhone, FiMapPin, FiEdit2 } from 'react-icons/fi'
import Image from 'next/image'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/app/services/firebase/config'
import { updateProfile } from 'firebase/auth'
import type { UserProfile } from '@/app/types/user'

type EditProfileFormProps = {
  profile: UserProfile
  onUpdate: () => void
  onCancel: () => void
}

export default function EditProfileForm({ profile, onUpdate, onCancel }: EditProfileFormProps) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    address: profile.address || '',
    bio: profile.bio || ''
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const profilePhotoRef = useRef<HTMLInputElement>(null)
  const coverPhotoRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const isProfile = type === 'profile'
    const setUploading = isProfile ? setUploadingPhoto : setUploadingCover
    setUploading(true)

    try {
      // Supprimer l'ancienne photo si elle existe
      const oldPhotoURL = isProfile ? profile.photoURL : profile.coverURL
      if (oldPhotoURL) {
        const oldPhotoRef = ref(storage, oldPhotoURL)
        try {
          await deleteObject(oldPhotoRef)
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'ancienne photo:', error)
        }
      }

      // Upload de la nouvelle photo
      const path = isProfile ? 'profile-photos' : 'cover-photos'
      const storageRef = ref(storage, `${path}/${user.uid}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const photoURL = await getDownloadURL(snapshot.ref)

      // Mettre à jour le profil
      const updates = isProfile ? { photoURL } : { coverURL: photoURL }
      
      if (isProfile) {
        await updateProfile(user, { photoURL })
      }

      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, updates)

      showAlert(`Photo ${isProfile ? 'de profil' : 'de couverture'} mise à jour avec succès`, 'success')
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo:', error)
      showAlert('Erreur lors de la mise à jour de la photo', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      })

      showAlert('Profil mis à jour avec succès', 'success')
      onUpdate()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      showAlert('Erreur lors de la mise à jour du profil', 'error')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Photo de couverture */}
      <div className="relative h-48">
        <div className="absolute inset-0">
          {profile.coverURL ? (
            <Image
              src={profile.coverURL}
              alt="Couverture"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600" />
          )}
        </div>
        <button
          onClick={() => coverPhotoRef.current?.click()}
          disabled={uploadingCover}
          className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <FiCamera className="w-5 h-5" />
        </button>
        <input
          ref={coverPhotoRef}
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoChange(e, 'cover')}
          className="hidden"
        />
      </div>

      {/* Photo de profil */}
      <div className="relative -mt-20 ml-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700">
            {profile.photoURL ? (
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
            onClick={() => profilePhotoRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
          >
            <FiCamera className="w-5 h-5" />
          </button>
          <input
            ref={profilePhotoRef}
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e, 'profile')}
            className="hidden"
          />
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prénom
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Téléphone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Adresse
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
} 