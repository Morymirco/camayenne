import { 
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { db } from './config'

// Collection reference
const favoritesRef = collection(db, 'favorites')

// Add to favorites
export const addToFavorites = async (userId: string, locationId: string) => {
  try {
    await addDoc(favoritesRef, {
      userId,
      locationId,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    throw error
  }
}

// Remove from favorites
export const removeFromFavorites = async (userId: string, locationId: string) => {
  try {
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('locationId', '==', locationId)
    )
    const snapshot = await getDocs(q)
    snapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref)
    })
  } catch (error) {
    throw error
  }
}

// Get user favorites
export const getUserFavorites = async (userId: string) => {
  try {
    const q = query(favoritesRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    throw error
  }
} 