'use client'

import { useEffect, useState } from 'react'
import L from 'leaflet'

type LocationPickerProps = {
  onLocationSelect: (lat: number, lng: number) => void
  initialLocation: [number, number]
  readOnly?: boolean
}

export default function LocationPicker({ onLocationSelect, initialLocation, readOnly = false }: LocationPickerProps) {
  const [marker, setMarker] = useState<L.Marker | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initialiser la carte
    const map = L.map('location-picker').setView(initialLocation, 15)

    // Ajouter la couche de carte sombre
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map)

    // Créer l'icône personnalisée
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: #4A90E2;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })

    // Ajouter le marqueur initial
    const newMarker = L.marker(initialLocation, { 
      icon: customIcon, 
      draggable: !readOnly
    })
      .addTo(map)
      .bindPopup(readOnly ? 'Emplacement du lieu' : 'Faites glisser pour définir l\'emplacement')
    
    setMarker(newMarker)

    if (!readOnly) {
      // Gérer le déplacement du marqueur seulement si non readOnly
      newMarker.on('dragend', () => {
        const position = newMarker.getLatLng()
        onLocationSelect(position.lat, position.lng)
      })

      // Gérer les clics sur la carte seulement si non readOnly
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        newMarker.setLatLng([lat, lng])
        onLocationSelect(lat, lng)
      })
    }

    return () => {
      map.remove()
    }
  }, [initialLocation, onLocationSelect, readOnly])

  return <div id="location-picker" className="h-full w-full" />
} 