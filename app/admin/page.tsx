'use client'

import { db } from '@/app/services/firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiActivity, FiMapPin, FiMessageSquare, FiPlus, FiUsers } from 'react-icons/fi'
import AdminHeader from '../components/admin/AdminHeader'
import LocationsList from '../components/admin/LocationsList'

type Stats = {
  totalLocations: number
  totalUsers: number
  totalMessages: number
  totalReviews: number
}

export default function AdminPage() {
  const [locations, setLocations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalLocations: 0,
    totalUsers: 0,
    totalMessages: 0,
    totalReviews: 0
  })
  const router = useRouter()

  useEffect(() => {
    fetchStats()
    fetchLocations()
  }, [])

  const fetchStats = async () => {
    try {
      const [locationsSnap, usersSnap, messagesSnap, reviewsSnap] = await Promise.all([
        getDocs(collection(db, 'locations')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'messages')),
        getDocs(collection(db, 'reviews'))
      ])

      setStats({
        totalLocations: locationsSnap.size,
        totalUsers: usersSnap.size,
        totalMessages: messagesSnap.size,
        totalReviews: reviewsSnap.size
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const fetchLocations = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'locations'))
      const locationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // setLocations(locationsData)
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // const handleImport = (importedLocations: any[]) => {
  //   setLocations(importedLocations)
  // }

  return (
    <div className="p-4 sm:p-6">
      <AdminHeader title="Tableau de bord" />

      {/* Statistiques - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total des lieux</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalLocations}
              </h3>
            </div>
            <FiMapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Utilisateurs</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </h3>
            </div>
            <FiUsers className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalMessages}
              </h3>
            </div>
            <FiMessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avis</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalReviews}
              </h3>
            </div>
            <FiActivity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Actions rapides - Responsive grid */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/admin/locations/new"
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            <FiPlus className="mr-2" />
            Ajouter un lieu
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
          >
            <FiUsers className="mr-2" />
            Gérer les utilisateurs
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm sm:text-base"
          >
            <FiActivity className="mr-2" />
            Paramètres
          </Link>
        </div>
      </div>

      {/* Liste des lieux et import/export */}
      <div className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          {/* <ImportExportLocations
            locations={locations}
            // onImport={handleImport}
          /> */}
        </div>
        <div className="overflow-x-auto">
          <LocationsList locations={locations} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
} 