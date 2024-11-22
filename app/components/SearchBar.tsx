'use client'

import { db } from '@/app/services/firebase/config'
import type { Location } from '@/app/types/location'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { FiFilter, FiSearch, FiX } from 'react-icons/fi'

type SearchBarProps = {
  onLocationSelect: (location: Location) => void
}

type Filter = {
  id: string
  label: string
  checked: boolean
}

const FILTERS: Filter[] = [
  { id: 'restaurant', label: 'Restaurants', checked: false },
  { id: 'hotel', label: 'Hôtels', checked: false },
  { id: 'pharmacie', label: 'Pharmacies', checked: false },
  { id: 'école', label: 'Écoles', checked: false },
  { id: 'banque', label: 'Banques', checked: false },
  { id: 'magasin', label: 'Magasins', checked: false },
  { id: 'café', label: 'Cafés', checked: false },
  { id: 'hôpital', label: 'Hôpitaux', checked: false }
]

// Composant personnalisé pour les checkboxes
const CustomCheckbox = ({ id, label, checked, onChange }: {
  id: string
  label: string
  checked: boolean
  onChange: () => void
}) => (
  <label
    htmlFor={id}
    className="flex items-center space-x-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
  >
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-6 h-6 border-2 rounded-lg border-gray-300 dark:border-gray-600 
        peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all
        group-hover:border-blue-400 dark:group-hover:border-blue-400">
        <svg
          className={`w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            ${checked ? 'text-white scale-100' : 'scale-0'}
            transition-transform duration-200 ease-out`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
      {label}
    </span>
  </label>
)

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState<Filter[]>(FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchCache = useRef<Map<string, Location[]>>(new Map())

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocations = async (searchTerm: string, activeFilters: string[]) => {
    const cacheKey = `${searchTerm}-${activeFilters.join(',')}`
    
    if (searchCache.current.has(cacheKey)) {
      return searchCache.current.get(cacheKey)!
    }

    const locationsRef = collection(db, 'locations')
    let searchResults: Location[] = []

    try {
      // Créer une requête de base
      let baseQuery = query(locationsRef)
      
      // Ajouter les filtres de type si nécessaire
      if (activeFilters.length > 0) {
        baseQuery = query(baseQuery, where('type', 'in', activeFilters))
      }

      // Récupérer tous les documents qui correspondent aux filtres
      const snapshot = await getDocs(baseQuery)
      
      // Filtrer les résultats côté client pour une recherche plus flexible
      searchResults = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Location))
        .filter(location => {
          const searchLower = searchTerm.toLowerCase()
          const nameLower = location.name.toLowerCase()
          const typeLower = location.type.toLowerCase()
          const addressLower = location.address.toLowerCase()
          const descriptionLower = location.description.toLowerCase()

          // Recherche partielle dans tous les champs pertinents
          return nameLower.includes(searchLower) ||
                 typeLower.includes(searchLower) ||
                 addressLower.includes(searchLower) ||
                 descriptionLower.includes(searchLower)
        })

      // Trier les résultats par pertinence
      searchResults.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, searchTerm)
        const bScore = calculateRelevanceScore(b, searchTerm)
        return bScore - aScore
      })

      // Limiter le nombre de résultats
      searchResults = searchResults.slice(0, 5)

      // Mettre en cache les résultats
      searchCache.current.set(cacheKey, searchResults)

      if (searchCache.current.size > 100) {
        const firstKey = searchCache.current.keys().next().value;
        if (firstKey !== undefined) {
          searchCache.current.delete(firstKey);
        }
      }
      

      return searchResults
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      return []
    }
  }

  const calculateRelevanceScore = (location: Location, searchTerm: string): number => {
    let score = 0
    const term = searchTerm.toLowerCase()

    // Nom exact : +10 points
    if (location.name.toLowerCase() === term) score += 10
    // Nom commence par le terme : +5 points
    else if (location.name.toLowerCase().startsWith(term)) score += 5
    // Nom contient le terme : +3 points
    else if (location.name.toLowerCase().includes(term)) score += 3

    // Type exact : +4 points
    if (location.type.toLowerCase() === term) score += 4
    // Type contient le terme : +2 points
    else if (location.type.toLowerCase().includes(term)) score += 2

    // Adresse contient le terme : +1 point
    if (location.address.toLowerCase().includes(term)) score += 1

    return score
  }

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const activeFilters = filters.filter(f => f.checked).map(f => f.id)
        const results = await searchLocations(searchQuery.toLowerCase(), activeFilters)
        setSuggestions(results)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, filters])

  const handleFilterChange = (filterId: string) => {
    setFilters(filters.map(filter => 
      filter.id === filterId ? { ...filter, checked: !filter.checked } : filter
    ))
  }

  const handleSelect = (location: Location) => {
    onLocationSelect(location)
    setSearchQuery('')
    setShowSuggestions(false)
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Rechercher un lieu..."
          className="w-full px-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX />
          </button>
        )}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
            filters.some(f => f.checked) ? 'text-blue-500' : ''
          }`}
        >
          <FiFilter />
        </button>
      </div>

      {/* Filtres avec nouveau design */}
      {showFilters && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrer par type
            </h3>
            {filters.some(f => f.checked) && (
              <button
                onClick={() => setFilters(filters.map(f => ({ ...f, checked: false })))}
                className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Réinitialiser
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {filters.map((filter) => (
              <CustomCheckbox
                key={filter.id}
                id={filter.id}
                label={filter.label}
                checked={filter.checked}
                onChange={() => handleFilterChange(filter.id)}
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filters.filter(f => f.checked).length} filtre(s) sélectionné(s)
            </p>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && (searchQuery.trim() || suggestions.length > 0) && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Recherche en cours...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((location) => (
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
          ) : searchQuery.trim() ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucun résultat trouvé
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
} 