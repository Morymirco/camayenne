'use client'

import React, { useState, useEffect } from 'react'
import { FiMap, FiFilter, FiLayers, FiSettings, FiCheck, FiNavigation, FiHome, FiCrosshair, FiMenu, FiX } from 'react-icons/fi'
import LocationList from './LocationList'
import SearchBar from './SearchBar'
import type { Location } from '@/app/types/location'

type FilterOption = {
  id: string;
  label: string;
  checked: boolean;
}

type LayerOption = {
  id: string;
  label: string;
}

const Sidebar = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLayer, setSelectedLayer] = useState('dark') // Couche par défaut
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: 'restaurants', label: 'Restaurants', checked: false },
    { id: 'hotels', label: 'Hôtels', checked: false },
    { id: 'pharmacies', label: 'Pharmacies', checked: false },
    { id: 'ecoles', label: 'Écoles', checked: false },
    { id: 'banques', label: 'Banques', checked: false },
  ])
  const [currentZoom, setCurrentZoom] = useState(15)

  const layers: LayerOption[] = [
    { id: 'dark', label: 'Mode sombre' },
    { id: 'satellite', label: 'Vue satellite' },
    { id: 'terrain', label: 'Relief' },
    { id: 'traffic', label: 'Trafic routier' },
  ]

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName)
  }

  const handleFilterChange = (filterId: string) => {
    const newFilters = filters.map(filter => 
      filter.id === filterId ? { ...filter, checked: !filter.checked } : filter
    )
    setFilters(newFilters)
    
    // Émettre l'événement de changement de filtre
    window.dispatchEvent(new CustomEvent('filterChange', {
      detail: {
        filterId,
        checked: !filters.find(f => f.id === filterId)?.checked
      }
    }))
  }

  const handleLayerChange = (layerId: string) => {
    setSelectedLayer(layerId)
    const event = new CustomEvent('changeMapLayer', {
      detail: { layerId }
    })
    window.dispatchEvent(event)
  }

  const handleCenterOnUser = () => {
    const event = new CustomEvent('centerOnUser')
    window.dispatchEvent(event)
  }

  const handleCenterOnCamayenne = () => {
    const event = new CustomEvent('centerOnCamayenne')
    window.dispatchEvent(event)
  }

  const handleToggleFollowMode = () => {
    const event = new CustomEvent('toggleFollowMode')
    window.dispatchEvent(event)
  }

  const handleLocationSelect = (location: Location) => {
    // Centrer la carte sur le lieu sélectionné
    window.dispatchEvent(new CustomEvent('centerOnLocation', {
      detail: { lat: location.latitude, lng: location.longitude }
    }))

    // Afficher les détails du lieu
    window.dispatchEvent(new CustomEvent('showLocationDetails', {
      detail: location
    }))
  }

  useEffect(() => {
    const handleZoomChange = (event: CustomEvent) => {
      setCurrentZoom(event.detail.zoom)
    }

    window.addEventListener('zoomChange', handleZoomChange as EventListener)

    return () => {
      window.removeEventListener('zoomChange', handleZoomChange as EventListener)
    }
  }, [])

  // Fermer le menu mobile quand on clique sur un lien
  const handleMobileClick = (action: () => void) => {
    action()
    setIsMobileMenuOpen(false)
  }

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(true)
      } else {
        setIsMobileMenuOpen(false)
      }
    }

    // Initialiser l'état en fonction de la taille de l'écran
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Bouton hamburger pour mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <FiX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <FiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Overlay sombre pour mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex flex-col h-full">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Camayenne</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Navigation</p>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <SearchBar onLocationSelect={(location) => handleMobileClick(() => handleLocationSelect(location))} />
          </div>

          {/* Menu principal avec onglets */}
          <div className="flex-1 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                onClick={() => handleMobileClick(() => setActiveMenu('map'))}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeMenu === 'map'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Carte
              </button>
              <button
                onClick={() => handleMobileClick(() => setActiveMenu('list'))}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeMenu === 'list'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Lieux
              </button>
            </div>

            <div className="overflow-y-auto h-full">
              {activeMenu === 'list' ? (
                <LocationList />
              ) : (
                <nav className="space-y-2">
                  <ul className="space-y-2">
                    <li>
                      <button 
                        onClick={() => toggleMenu('map')}
                        className={`flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${activeMenu === 'map' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        <FiMap className="mr-3" />
                        Carte
                      </button>
                      {activeMenu === 'map' && (
                        <div className="ml-8 mt-2 space-y-2">
                          <button
                            onClick={handleCenterOnUser}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group"
                          >
                            <FiCrosshair className="mr-2" />
                            Ma position
                          </button>
                          <button
                            onClick={handleCenterOnCamayenne}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group"
                          >
                            <FiHome className="mr-2" />
                            Centre de Camayenne
                          </button>
                          <button
                            onClick={handleToggleFollowMode}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group"
                          >
                            <FiNavigation className="mr-2" />
                            Mode suivi
                          </button>
                          <div className="px-3 py-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Zoom actuel: {currentZoom}x
                            </p>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => window.dispatchEvent(new CustomEvent('zoomIn'))}
                                className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                              >
                                Zoom +
                              </button>
                              <button
                                onClick={() => window.dispatchEvent(new CustomEvent('zoomOut'))}
                                className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                              >
                                Zoom -
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                    <li>
                      <button 
                        onClick={() => toggleMenu('filters')}
                        className={`flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${activeMenu === 'filters' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        <FiFilter className="mr-3" />
                        Filtres
                      </button>
                      {activeMenu === 'filters' && (
                        <div className="ml-8 mt-2 space-y-2">
                          {filters.map(filter => (
                            <label key={filter.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={filter.checked}
                                  onChange={() => handleFilterChange(filter.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
                                  {filter.checked && (
                                    <FiCheck className="w-full h-full text-white p-[2px]" />
                                  )}
                                </div>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">
                                {filter.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </li>
                    <li>
                      <button 
                        onClick={() => toggleMenu('layers')}
                        className={`flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${activeMenu === 'layers' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        <FiLayers className="mr-3" />
                        Couches
                      </button>
                      {activeMenu === 'layers' && (
                        <div className="ml-8 mt-2 space-y-2">
                          {layers.map(layer => (
                            <label key={layer.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group">
                              <div className="relative">
                                <input
                                  type="radio"
                                  name="mapLayer"
                                  value={layer.id}
                                  checked={selectedLayer === layer.id}
                                  onChange={() => handleLayerChange(layer.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full peer-checked:border-blue-500 transition-all">
                                  <div className={`w-3 h-3 m-[3px] rounded-full transition-all ${selectedLayer === layer.id ? 'bg-blue-500' : 'bg-transparent'}`} />
                                </div>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">
                                {layer.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>

          {/* Pied de page */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => handleMobileClick(() => toggleMenu('settings'))}
              className={`flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${activeMenu === 'settings' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              <FiSettings className="mr-3" />
              Paramètres
            </button>
            {activeMenu === 'settings' && (
              <div className="mt-2 p-4 space-y-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Version 1.0.0</p>
                <button className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar 