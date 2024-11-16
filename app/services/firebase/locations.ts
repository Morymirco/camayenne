import type { Location } from '@/app/types/location'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from './config'
import { auth } from './config'

// Collection reference
const locationsRef = collection(db, 'locations')

const uploadImage = async (image: File): Promise<string> => {
  try {
    // Nettoyer le nom du fichier
    const cleanFileName = image.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const storageRef = ref(storage, `locations/${Date.now()}_${cleanFileName}`)
    
    // Upload avec metadata
    const metadata = {
      contentType: image.type,
      customMetadata: {
        'uploadedBy': auth.currentUser?.uid || 'unknown'
      }
    }
    
    const snapshot = await uploadBytes(storageRef, image, metadata)
    const downloadUrl = await getDownloadURL(snapshot.ref)
    return downloadUrl
  } catch (error: any) {
    console.error('Erreur lors de l\'upload:', error)
    if (error.code === 'storage/unauthorized') {
      throw new Error('Vous devez être connecté pour uploader des images')
    }
    throw new Error('Erreur lors de l\'upload de l\'image')
  }
}

// Add a new location
export const addLocation = async (
  locationData: Omit<Location, 'id'>, 
  coverImage?: File | null,
  galleryImages: File[] = []
) => {
  try {
    let coverImageUrl = ''
    let galleryUrls: string[] = []

    // Upload de l'image de couverture
    if (coverImage) {
      coverImageUrl = await uploadImage(coverImage)
    }

    // Upload des images de la galerie
    if (galleryImages.length > 0) {
      const uploadPromises = galleryImages.map(image => uploadImage(image))
      galleryUrls = await Promise.all(uploadPromises)
    }

    const docRef = await addDoc(locationsRef, {
      ...locationData,
      image: coverImageUrl,
      gallery: galleryUrls,
      createdAt: new Date().toISOString(),
      userId: auth.currentUser?.uid
    })

    return { 
      id: docRef.id, 
      ...locationData, 
      image: coverImageUrl,
      gallery: galleryUrls,
      userId: auth.currentUser?.uid 
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error)
    throw error
  }
}

// Get all locations
export const getLocations = async () => {
  try {
    const snapshot = await getDocs(locationsRef)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Location[]
  } catch (error) {
    throw error
  }
}

// Get location by ID
export const getLocationById = async (id: string) => {
  try {
    const docRef = doc(db, 'locations', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Location
    }
    return null
  } catch (error) {
    throw error
  }
}

// Update location
export const updateLocation = async (id: string, locationData: Partial<Location>, newImage?: File) => {
  try {
    let imageUrl = locationData.image

    if (newImage) {
      const storageRef = ref(storage, `locations/${Date.now()}_${newImage.name}`)
      const snapshot = await uploadBytes(storageRef, newImage)
      imageUrl = await getDownloadURL(snapshot.ref)
    }

    const docRef = doc(db, 'locations', id)
    await updateDoc(docRef, {
      ...locationData,
      image: imageUrl,
      updatedAt: new Date().toISOString()
    })

    return { id, ...locationData, image: imageUrl }
  } catch (error) {
    throw error
  }
}

// Delete location
export const deleteLocation = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'locations', id))
  } catch (error) {
    throw error
  }
}

// Get locations by type
export const getLocationsByType = async (type: string) => {
  try {
    const q = query(locationsRef, where('type', '==', type))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Location[]
  } catch (error) {
    throw error
  }
}

export const addComment = async (locationId: string, commentData: {
  userId: string;
  userName: string;
  text: string;
  rating: number;
  createdAt: string;
}) => {
  try {
    const locationRef = doc(db, 'locations', locationId)
    const locationDoc = await getDoc(locationRef)
    
    if (!locationDoc.exists()) {
      throw new Error('Location not found')
    }

    const currentComments = locationDoc.data().comments || []
    await updateDoc(locationRef, {
      comments: arrayUnion(commentData),
      rating: calculateNewRating(currentComments, commentData.rating)
    })

    return commentData
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error)
    throw error
  }
}

export const deleteComment = async (locationId: string, commentId: string) => {
  try {
    const locationRef = doc(db, 'locations', locationId)
    const locationDoc = await getDoc(locationRef)
    
    if (!locationDoc.exists()) {
      throw new Error('Location not found')
    }

    const comments = locationDoc.data().comments || []
    const commentToDelete = comments.find((c: any) => c.id === commentId)
    
    if (!commentToDelete) {
      throw new Error('Comment not found')
    }

    await updateDoc(locationRef, {
      comments: arrayRemove(commentToDelete),
      rating: calculateNewRating(
        comments.filter((c: any) => c.id !== commentId),
        0
      )
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error)
    throw error
  }
}

const calculateNewRating = (comments: any[], newRating: number = 0): number => {
  if (comments.length === 0 && newRating === 0) return 0
  
  const totalRating = comments.reduce((sum: number, comment: any) => sum + comment.rating, 0)
  return newRating === 0 
    ? totalRating / comments.length 
    : (totalRating + newRating) / (comments.length + 1)
}

export const getComments = async (locationId: string) => {
  try {
    const locationRef = doc(db, 'locations', locationId)
    const locationDoc = await getDoc(locationRef)
    
    if (!locationDoc.exists()) {
      throw new Error('Location not found')
    }

    return locationDoc.data().comments || []
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error)
    throw error
  }
} 