export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  createdAt: string
  updatedAt?: string
  photoURL?: string
  coverURL?: string
  bio?: string
  role: 'user' | 'admin'
  settings?: {
    theme: 'light' | 'dark' | 'system'
    language: 'fr' | 'en'
    notifications: boolean
    emailNotifications: boolean
    autoZoom: boolean
  }
}

export type UserStats = {
  totalLists: number
  totalFavorites: number
  totalReviews: number
  averageRating: number
} 