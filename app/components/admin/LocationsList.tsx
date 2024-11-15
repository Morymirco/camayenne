import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

type Location = {
  id: number;
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  openingHours: string;
  latitude: number;
  longitude: number;
  image?: string;
}

type LocationsListProps = {
  locations: Location[];
  isLoading: boolean;
}

export default function LocationsList({ locations, isLoading }: LocationsListProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Coordonnées
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {locations.map((location) => (
              <tr key={`location-${location.id}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {location.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {location.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => router.push(`/admin/locations/${location.id}`)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      aria-label={`Voir ${location.name}`}
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => router.push(`/admin/locations/${location.id}/edit`)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      aria-label={`Modifier ${location.name}`}
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button 
                      key={`delete-${location.id}`}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      aria-label={`Supprimer ${location.name}`}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 