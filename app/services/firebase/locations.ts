import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  getDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './config'
import type { Location } from '@/app/types/location'

// Collection reference
const locationsRef = collection(db, 'locations')

// Add a new location
export const addLocation = async (locationData: Omit<Location, 'id'>, image?: File) => {
  try {
    let imageUrl = ''
    if (image) {
      const storageRef = ref(storage, `locations/${Date.now()}_${image.name}`)
      const snapshot = await uploadBytes(storageRef, image)
      imageUrl = await getDownloadURL(snapshot.ref)
    }

    const docRef = await addDoc(locationsRef, {
      ...locationData,
      image: imageUrl,
      createdAt: new Date().toISOString()
    })

    return { id: docRef.id, ...locationData, image: imageUrl }
  } catch (error) {
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