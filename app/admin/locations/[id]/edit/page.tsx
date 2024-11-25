'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiArrowLeft, FiImage, FiX, FiPlus } from 'react-icons/fi'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/services/firebase/config'
import { useAlert } from '@/app/contexts/AlertContext'
import type { Location } from '@/app/types/location'
import Image from 'next/image'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/app/services/firebase/config'
import { locationTypes } from '@/app/types/locationTypes'

export default function EditLocation({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showAlert } = useAlert()
  const [location, setLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const docRef = doc(db, 'locations', params.id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setLocation({ id: docSnap.id, ...docSnap.data() } as Location)
        } else {
          showAlert('Lieu non trouvé', 'error')
          router.push('/admin')
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        showAlert('Erreur lors du chargement du lieu', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    loadLocation()
  }, [params.id, router, showAlert])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location) return

    setIsSaving(true)
    try {
      const docRef = doc(db, 'locations', location.id)
      await updateDoc(docRef, {
        ...location,
        updatedAt: new Date().toISOString()
      })

      showAlert('Lieu mis à jour avec succès', 'success')
      router.push('/admin')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      showAlert('Erreur lors de la mise à jour', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !location) return

    setUploadingCover(true)
    try {
      if (location.image) {
        const oldImageRef = ref(storage, location.image)
        await deleteObject(oldImageRef)
      }

      const storageRef = ref(storage, `locations/${location.id}/cover/${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const imageUrl = await getDownloadURL(snapshot.ref)

      setLocation({ ...location, image: imageUrl })
      showAlert('Image de couverture mise à jour', 'success')
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      showAlert('Erreur lors de la mise à jour de l\'image', 'error')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !location) return

    setUploadingGallery(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `locations/${location.id}/gallery/${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        return getDownloadURL(snapshot.ref)
      })

      const newImages = await Promise.all(uploadPromises)
      const currentGallery = location.gallery || []
      
      setLocation({
        ...location,
        gallery: [...currentGallery, ...newImages]
      })

      showAlert('Images ajoutées à la galerie', 'success')
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      showAlert('Erreur lors de l\'ajout des images', 'error')
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleRemoveImage = async (imageUrl: string) => {
    if (!location) return

    try {
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)

      setLocation({
        ...location,
        gallery: location.gallery?.filter(url => url !== imageUrl) || []
      })

      showAlert('Image supprimée', 'success')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showAlert('Erreur lors de la suppression de l\'image', 'error')
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !location) return

    setUploadingImage(true)
    try {
      if (location.image) {
        try {
          const oldImageRef = ref(storage, location.image)
          await deleteObject(oldImageRef)
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'ancienne image:', error)
        }
      }

      const storageRef = ref(storage, `locations/${location.id}/images/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const imageUrl = await getDownloadURL(snapshot.ref)

      setLocation({ ...location, image: imageUrl })
      showAlert('Image mise à jour avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      showAlert('Erreur lors de la mise à jour de l\'image', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!location) return null

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
        <h1 className="text-2xl font-bold">Modifier {location.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom
          </label>
          <input
            type="text"
            value={location.name}
            onChange={(e) => setLocation({ ...location, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={location.type}
            onChange={(e) => setLocation({ ...location, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">Sélectionner un type</option>
            {locationTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={location.description}
            onChange={(e) => setLocation({ ...location, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adresse
          </label>
          <input
            type="text"
            value={location.address}
            onChange={(e) => setLocation({ ...location, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={location.latitude}
              onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={location.longitude}
              onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image de couverture
          </label>
          <div className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {location.image ? (
              <Image
                src={location.image}
                alt="Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FiImage className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                {uploadingCover ? 'Upload en cours...' : 'Changer l\'image'}
              </button>
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Galerie
          </label>
          <div className="grid grid-cols-3 gap-4">
            {location.gallery?.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(imageUrl)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiPlus className="w-8 h-8 text-gray-400" />
            </button>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryAdd}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image
          </label>
          <div className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {location?.image ? (
              <Image
                src={location.image}
                alt={location.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FiImage className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                {uploadingImage ? 'Upload en cours...' : 'Changer l\'image'}
              </button>
            </div>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            <FiSave className="mr-2" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
} 