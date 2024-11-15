'use client'

import Sidebar from '../components/Sidebar'
import MapComponent from '../components/MapComponent'

const MapPage = () => {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
        <div className="h-full w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
          <MapComponent />
        </div>
      </div>
    </div>
  )
}

export default MapPage 