import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from './config'

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName: name })
    return userCredential.user
  } catch (error) {
    throw error
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
  }
}

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw error
  }
}

export const createUserProfile = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      ...data,
      role: 'user',
      favorites: [],
      lists: [],
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    throw error
  }
} 