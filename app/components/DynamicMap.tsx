'use client'

import { useEffect, useState } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

declare global {
  interface Window {
    L: typeof L & {
      Routing: {
        control: (options: any) => any;
      };
    };
  }
}

export default function DynamicMap() {
  // ... tout le code existant de MapComponent ...
  
  const handleShowRoute = (event: any) => {
    const { lat, lng } = event.detail
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        
        if (typeof window !== 'undefined' && window.L && window.L.Routing) {
          const routingControl = window.L.Routing.control({
            waypoints: [
              window.L.latLng(userLat, userLng),
              window.L.latLng(lat, lng)
            ],
            routeWhileDragging: true,
            lineOptions: {
              styles: [{ color: '#4A90E2', weight: 4 }]
            },
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true
          }).addTo(map)
        }
      })
    }
  }

  return (
    <div className="relative h-full w-full">
      <div id="map" className="h-full w-full" />
      {/* ... reste du JSX ... */}
    </div>
  )
} 