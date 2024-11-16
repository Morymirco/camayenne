'use client'

import Link from 'next/link'
import { FiHome, FiArrowLeft } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Image ou illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-blue-500 dark:text-blue-400">
            404
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page introuvable
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Retour
          </button>
          <Link
            href="/"
            className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FiHome className="mr-2" />
            Accueil
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Vous pouvez essayer :
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Vérifier l'URL pour les erreurs de frappe</li>
            <li>• Retourner à la page précédente</li>
            <li>• Aller à la page d'accueil</li>
            <li>• Contacter le support si le problème persiste</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 