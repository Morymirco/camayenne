import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from './config'
import type { Location } from '@/app/types/location'

export type SavedList = {
  id: string;
  name: string;
  locations: Location[];
  createdAt: string;
  userId: string;
  description?: string;
  isPublic: boolean;
}

const listsRef = collection(db, 'lists')

// Créer une nouvelle liste
export const createList = async (userId: string, data: Omit<SavedList, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(listsRef, {
      ...data,
      userId,
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...data, createdAt: new Date().toISOString() }
  } catch (error) {
    console.error('Erreur lors de la création de la liste:', error)
    throw error
  }
}

// Récupérer les listes d'un utilisateur
export const getUserLists = async (userId: string) => {
  try {
    const q = query(listsRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedList[]
  } catch (error) {
    console.error('Erreur lors de la récupération des listes:', error)
    throw error
  }
}

// Mettre à jour une liste
export const updateList = async (listId: string, data: Partial<SavedList>) => {
  try {
    const docRef = doc(db, 'lists', listId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la liste:', error)
    throw error
  }
}

// Supprimer une liste
export const deleteList = async (listId: string) => {
  try {
    await deleteDoc(doc(db, 'lists', listId))
  } catch (error) {
    console.error('Erreur lors de la suppression de la liste:', error)
    throw error
  }
}

// Ajouter un lieu à une liste
export const addLocationToList = async (listId: string, location: Location) => {
  try {
    const docRef = doc(db, 'lists', listId)
    await updateDoc(docRef, {
      locations: arrayUnion(location),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur lors de l\'ajout du lieu à la liste:', error)
    throw error
  }
}

// Retirer un lieu d'une liste
export const removeLocationFromList = async (listId: string, locationId: string) => {
  try {
    const docRef = doc(db, 'lists', listId)
    await updateDoc(docRef, {
      locations: arrayRemove(locationId),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur lors du retrait du lieu de la liste:', error)
    throw error
  }
} 