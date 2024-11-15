import React from 'react'
import { FiPlus } from 'react-icons/fi'
import Link from 'next/link'

type AdminHeaderProps = {
  title: string
}

const AdminHeader = ({ title }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gérez vos points d'intérêt
        </p>
      </div>
      <Link
        href="/admin/locations/new"
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <FiPlus className="mr-2" />
        Ajouter un lieu
      </Link>
    </div>
  )
}

export default AdminHeader 