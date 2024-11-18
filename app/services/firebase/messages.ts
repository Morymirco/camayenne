import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
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
      where('toUserId', '==', userId)
    )
    
    const snapshot = await getDocs(q)
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[]

    return messages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    throw error
  }
}

export const sendMessage = async (messageData: Omit<Message, 'id'>) => {
  try {
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      createdAt: new Date().toISOString(),
      read: false
    })
    
    return {
      id: docRef.id,
      ...messageData
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    throw error
  }
}

export const markMessageAsRead = async (messageId: string) => {
  try {
    const messageRef = doc(db, 'messages', messageId)
    await updateDoc(messageRef, {
      read: true,
      readAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur lors du marquage du message comme lu:', error)
    throw error
  }
} 