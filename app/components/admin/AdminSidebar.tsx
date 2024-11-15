import { FiMap, FiPlus, FiList, FiSettings, FiLogOut } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminSidebar() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        </div>
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiList className="mr-3" />
                Liste des lieux
              </Link>
            </li>
            <li>
              <Link href="/admin/locations/new" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiPlus className="mr-3" />
                Ajouter un lieu
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiSettings className="mr-3" />
                Paramètres
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiLogOut className="mr-3" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  )
} 