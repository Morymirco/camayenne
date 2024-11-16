import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from './config'

export type Message = {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  createdAt: string
  read: boolean
  fromAdmin?: boolean
}

const messagesRef = collection(db, 'messages')

export const getUserMessages = async (userId: string) => {
  try {
    const q = query(
      messagesRef,
      where('toUserId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[]
  } catch (error) {
    throw error
  }
}

export const sendMessage = async (message: Omit<Message, 'id'>) => {
  try {
    const docRef = await addDoc(messagesRef, {
      ...message,
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...message }
  } catch (error) {
    throw error
  }
} 