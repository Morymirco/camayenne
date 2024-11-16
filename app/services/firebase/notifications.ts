import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, Timestamp } from 'firebase/firestore'
import { db } from './config'

export type Notification = {
  id: string
  userId: string
  type: 'suggestion' | 'system' | 'social'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export type Suggestion = {
  id: string
  userId: string
  locationId?: string
  type: 'new_location' | 'update_info' | 'report_issue'
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

const notificationsRef = collection(db, 'notifications')
const suggestionsRef = collection(db, 'suggestions')

// Notifications
export const getNotifications = async (userId: string) => {
  try {
    const q = query(
      notificationsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[]
  } catch (error) {
    throw error
  }
}

export const addNotification = async (notification: Omit<Notification, 'id'>) => {
  try {
    const docRef = await addDoc(notificationsRef, {
      ...notification,
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...notification }
  } catch (error) {
    throw error
  }
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date().toISOString()
    })
  } catch (error) {
    throw error
  }
}

// Suggestions
export const addSuggestion = async (suggestion: Omit<Suggestion, 'id' | 'status'>) => {
  try {
    const docRef = await addDoc(suggestionsRef, {
      ...suggestion,
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...suggestion, status: 'pending' as const }
  } catch (error) {
    throw error
  }
}

export const getUserSuggestions = async (userId: string) => {
  try {
    const q = query(
      suggestionsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Suggestion[]
  } catch (error) {
    throw error
  }
}

export const updateSuggestionStatus = async (
  suggestionId: string, 
  status: 'approved' | 'rejected',
  feedback?: string
) => {
  try {
    const suggestionRef = doc(db, 'suggestions', suggestionId)
    await updateDoc(suggestionRef, {
      status,
      feedback,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    throw error
  }
} 