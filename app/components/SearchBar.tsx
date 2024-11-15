'use client'

import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import type { Location } from '@/app/types/location'

type SearchBarProps = {
  onLocationSelect: (location: Location) => void
}

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchLocations = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        // Récupérer les lieux depuis le localStorage
        const storedLocations = localStorage.getItem('locations')
        const locations: Location[] = storedLocations ? JSON.parse(storedLocations) : []

        // Filtrer les résultats
        const filtered = locations.filter(location => {
          const searchTerm = query.toLowerCase()
          return (
            location.name.toLowerCase().includes(searchTerm) ||
            location.type.toLowerCase().includes(searchTerm) ||
            location.address.toLowerCase().includes(searchTerm) ||
            location.description.toLowerCase().includes(searchTerm)
          )
        })

        setResults(filtered)
        setShowResults(true)
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchLocations, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSelect = (location: Location) => {
    onLocationSelect(location)
    setQuery('')
    setShowResults(false)
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un lieu..."
          className="w-full px-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX />
          </button>
        )}
      </div>

      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Recherche en cours...
            </div>
          ) : (
            <ul>
              {results.map((location) => (
                <li key={location.id}>
                  <button
                    onClick={() => handleSelect(location)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {location.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {location.address}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {location.type}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
} 