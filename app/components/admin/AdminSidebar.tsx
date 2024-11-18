'use client'

import { FiMap, FiPlus, FiList, FiSettings, FiLogOut, FiUsers, FiMenu, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminSidebar() {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {isMobileOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Bouton toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-lg"
        >
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className={`text-xl font-bold text-gray-900 dark:text-white ${isCollapsed ? 'hidden' : 'block'}`}>
              Admin Panel
            </h1>
          </div>

          <nav className="flex-1 px-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin" 
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiList className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-3">Liste des lieux</span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/locations/new" 
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiPlus className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-3">Ajouter un lieu</span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/users" 
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiUsers className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-3">Gestion des utilisateurs</span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/settings" 
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiSettings className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-3">Paramètres</span>}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FiLogOut className="w-5 h-5" />
              {!isCollapsed && <span className="ml-3">Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 