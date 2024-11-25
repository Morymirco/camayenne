'use client'

import { getLocations } from '@/app/services/firebase/locations'
import type { Location } from '@/app/types/location'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { getMarkerIcon } from './MapMarkers'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

// Ajouter le VRViewer
const VRViewer = dynamic(() => import('./VRViewer'), {
  ssr: false
})

// Déclaration pour TypeScript
declare global {
  interface Window {
    L: typeof import('leaflet')
  }
}

// Types pour les couches de carte
type MapLayer = {
  id: string;
  url: string;
  attribution: string;
  name: string;
}

const MAP_LAYERS: MapLayer[] = [
  {
    id: 'dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'Mode sombre'
  },
  {
    id: 'satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    name: 'Satellite'
  },
  {
    id: 'terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    name: 'Terrain'
  },
  {
    id: 'traffic',
    url: `https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_API_KEY}`,
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>',
    name: 'Trafic'
  }
]

// Ajouter cette déclaration de type pour étendre Leaflet
declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
  }
}

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [activeLayer, setActiveLayer] = useState<string>('dark')
  const [map, setMap] = useState<L.Map | null>(null)
  const [layerControl, setLayerControl] = useState<L.Control.Layers | null>(null)
  const [followMode, setFollowMode] = useState(false)
  const [currentLayer, setCurrentLayer] = useState<L.TileLayer | null>(null)
  const [showVR, setShowVR] = useState(false)
  const [currentModelUrl, setCurrentModelUrl] = useState('')

  const createCustomPopupContent = (location: any) => {
    return `
      <div class="custom-popup">
        <div class="popup-image relative">
          <img src="${location.image || '/placeholder.jpg'}" alt="${location.name}" class="w-full h-32 object-cover rounded-t-lg"/>
          <div class="absolute top-2 left-2">
            <span class="px-2 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-xs rounded-full">
              ${location.type || 'Non défini'}
            </span>
          </div>
        </div>
        <div class="p-4 bg-gray-800">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-white">${location.name}</h3>
            ${location.rating !== undefined ? `
              <div class="flex items-center bg-yellow-500/80 px-2 py-1 rounded-full">
                <svg class="w-3 h-3 text-white mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="text-white text-xs font-medium">${Number(location.rating).toFixed(1)}</span>
              </div>
            ` : ''}
          </div>
          <p class="text-gray-300 text-sm mb-3">${location.description}</p>
          <div class="flex gap-2">
            <button 
              onclick='window.dispatchEvent(new CustomEvent("openVR", { 
                detail: { 
                  modelUrl: "/models/scene.glb",
                  locationName: "${location.name}"
                }
              }))'
              class="bg-gray-700 text-white px-3 py-1 rounded-full text-xs hover:bg-gray-600 transition-colors"
            >
              Voir en réalité virtuelle
            </button>
            <button 
              onclick='window.dispatchEvent(new CustomEvent("showRoute", { 
                detail: { 
                  lat: ${location.latitude},
                  lng: ${location.longitude}
                }
              }))'
              class="bg-blue-500 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              Itinéraire
            </button>
          </div>
        </div>
      </div>
    `
  }

  // Écouter les changements de couches depuis le Sidebar
  useEffect(() => {
    const handleLayerChange = (event: CustomEvent) => {
      if (!map) return
      
      const { layerId } = event.detail
      const selectedLayer = MAP_LAYERS.find(layer => layer.id === layerId)
      
      if (selectedLayer) {
        // Supprimer la couche actuelle si elle existe
        if (currentLayer) {
          map.removeLayer(currentLayer)
        }

        // Ajouter la nouvelle couche
        const newLayer = L.tileLayer(selectedLayer.url, {
          attribution: selectedLayer.attribution,
          maxZoom: 20
        }).addTo(map)
        
        setCurrentLayer(newLayer)
      }
    }

    window.addEventListener('changeMapLayer', handleLayerChange as EventListener)

    return () => {
      window.removeEventListener('changeMapLayer', handleLayerChange as EventListener)
    }
  }, [map, currentLayer])

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])

        const existingMap = document.getElementById('map')
        if (existingMap && 'L' in window) {
          const L = window.L
          
          const newMap = L.map('map').setView([latitude, longitude], 15)
          setMap(newMap)

          // Ajouter la couche de base (dark par défaut)
          const defaultLayer = L.tileLayer(MAP_LAYERS[0].url, {
            attribution: MAP_LAYERS[0].attribution,
            maxZoom: 20
          }).addTo(newMap)
          
          setCurrentLayer(defaultLayer)

          // Créer un objet pour stocker toutes les couches
          const baseMaps: { [key: string]: L.TileLayer } = {}
          MAP_LAYERS.forEach(layer => {
            baseMaps[layer.name] = L.tileLayer(layer.url, {
              attribution: layer.attribution,
              maxZoom: 20
            })
          })

          // Ajouter le contrôle des couches
          const control = L.control.layers(baseMaps).addTo(newMap)
          setLayerControl(control)

          // Point bleu pour la position utilisateur
          const userIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
              background-color: #4A90E2;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid #FFFFFF;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
            "></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })

          // Fonction pour obtenir l'icône selon le type de lieu
          const getLocationIcon = (type: string): string => {
            const icons: { [key: string]: string } = {
              restaurant: `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
              hotel: `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
              pharmacie: `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
              école: `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
              banque: `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
              magasin: `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
              café: `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
              hôpital: `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`
            }
            return icons[type.toLowerCase()] || icons.default
          }

          const userPopupContent = createCustomPopupContent({
            name: 'Votre position',
            description: 'Vous êtes actuellement ici',
            image: '/img.jpg',
            type: 'Ici',
            rating: null
          })

          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(newMap)
            .bindPopup(userPopupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            })
            .openPopup()

          // Charger et ajouter les lieux depuis Firebase avec des icônes personnalisées
          try {
            const firebaseLocations = await getLocations()
            console.log('Lieux chargés:', firebaseLocations)

            firebaseLocations.forEach((location: Location) => {
              const icon = L.divIcon({
                className: 'custom-div-icon',
                html: getMarkerIcon(location.type),
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
              console.log(location.image);

              L.marker([location.latitude, location.longitude], { icon: icon })
                .addTo(newMap)
                .bindPopup(createCustomPopupContent({
                  name: location.name,
                  description: location.description,
                  image: location.image,
                  type: location.type,
                  rating: location.rating,
                  latitude: location.latitude,
                  longitude: location.longitude
                }), {
                  maxWidth: 300,
                  className: 'custom-popup'
                })
            })
          } catch (error) {
            console.error('Erreur chargement des lieux:', error)
          }

          navigator.geolocation.watchPosition(
            (position) => {
              const newLat = position.coords.latitude
              const newLng = position.coords.longitude
              newMap.setView([newLat, newLng])
              
              const updatedPopupContent = createCustomPopupContent({
                name: 'Position actuelle',
                description: 'Votre position en temps réel',
                image: '/img.jpg',
                type: 'Ici',
                rating: null
              })

              L.marker([newLat, newLng], { icon: userIcon })
                .addTo(newMap)
                .bindPopup(updatedPopupContent, {
                  maxWidth: 300,
                  className: 'custom-popup'
                })
            },
            (error) => {
              console.error('Erreur de géolocalisation:', error)
            }
          )

          // Ajouter le cercle de Camayenne
          const camayenneCenter: [number, number] = [9.5370, -13.6785]
          const camayenneRadius = 1000 // rayon en mètres

          // Cercle principal
          L.circle(camayenneCenter, {
            radius: camayenneRadius,
            color: '#4A90E2',
            fillColor: '#4A90E2',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 10', // Ligne pointillée
          }).addTo(newMap)

          // Cercle intérieur (effet de pulsation)
          const pulsingCircle = L.circle(camayenneCenter, {
            radius: camayenneRadius * 0.8,
            color: '#4A90E2',
            fillColor: '#4A90E2',
            fillOpacity: 0.2,
            weight: 1,
            className: 'pulsing-circle'
          }).addTo(newMap)

          // Ajouter un popup au cercle
          pulsingCircle.bindPopup('Zone de Camayenne', {
            className: 'custom-popup'
          })

          return () => {
            newMap.remove()
          }
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error)
        const existingMap = document.getElementById('map')
        if (existingMap && 'L' in window) {
          const L = window.L
          const defaultLocation: [number, number] = [9.5370, -13.6785]
          
          const newMap = L.map('map').setView(defaultLocation, 15)
          setMap(newMap)

          // Ajouter la couche de base
          const baseLayer = L.tileLayer(MAP_LAYERS[0].url, {
            attribution: MAP_LAYERS[0].attribution,
            maxZoom: 20
          }).addTo(newMap)

          // Créer un objet pour stocker toutes les couches
          const baseMaps: { [key: string]: L.TileLayer } = {}
          MAP_LAYERS.forEach(layer => {
            baseMaps[layer.name] = L.tileLayer(layer.url, {
              attribution: layer.attribution,
              maxZoom: 20
            })
          })

          // Ajouter le contrôle des couches
          const control = L.control.layers(baseMaps).addTo(newMap)
          setLayerControl(control)

          const darkIcon = L.divIcon({
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
          
          const defaultPopupContent = createCustomPopupContent({
            name: 'Bienvenue à Camayenne',
            description: 'Point de départ de votre exploration',
            image: '/camayenne.jpg',
            type: 'Ici',
            rating: null
          })

          L.marker(defaultLocation, { icon: darkIcon })
            .addTo(newMap)
            .bindPopup(defaultPopupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            })
            .openPopup()

          return () => {
            newMap.remove()
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  }, [])

  // Écouter les changements de couches depuis le Sidebar
  useEffect(() => {
    if (map) {
      const handleCenterOnUser = () => {
        if (userLocation) {
          map.setView(userLocation, map.getZoom())
        }
      }

      const handleCenterOnCamayenne = () => {
        const camayenneLocation: [number, number] = [9.5370, -13.6785]
        map.setView(camayenneLocation, 15)
      }

      const handleToggleFollowMode = () => {
        setFollowMode(!followMode)
      }

      const handleZoomIn = () => {
        const newZoom = map.getZoom() + 1
        map.setZoom(newZoom)
      }

      const handleZoomOut = () => {
        const newZoom = map.getZoom() - 1
        map.setZoom(newZoom)
      }

      window.addEventListener('centerOnUser', handleCenterOnUser)
      window.addEventListener('centerOnCamayenne', handleCenterOnCamayenne)
      window.addEventListener('toggleFollowMode', handleToggleFollowMode)
      window.addEventListener('zoomIn', handleZoomIn)
      window.addEventListener('zoomOut', handleZoomOut)

      return () => {
        window.removeEventListener('centerOnUser', handleCenterOnUser)
        window.removeEventListener('centerOnCamayenne', handleCenterOnCamayenne)
        window.removeEventListener('toggleFollowMode', handleToggleFollowMode)
        window.removeEventListener('zoomIn', handleZoomIn)
        window.removeEventListener('zoomOut', handleZoomOut)
      }
    }
  }, [map, userLocation, followMode])

  useEffect(() => {
    if (map) {
      // Ajouter un écouteur d'événement pour le zoom
      map.on('zoomend', () => {
        const currentZoom = map.getZoom()
        window.dispatchEvent(new CustomEvent('zoomChange', {
          detail: { zoom: Math.round(currentZoom) }
        }))
      })

      // ... autres écouteurs d'événements ...

      const handleZoomIn = () => {
        const newZoom = map.getZoom() + 1
        map.setZoom(newZoom)
      }

      const handleZoomOut = () => {
        const newZoom = map.getZoom() - 1
        map.setZoom(newZoom)
      }

      window.addEventListener('zoomIn', handleZoomIn)
      window.addEventListener('zoomOut', handleZoomOut)

      return () => {
        window.removeEventListener('zoomIn', handleZoomIn)
        window.removeEventListener('zoomOut', handleZoomOut)
        // Nettoyer l'écouteur de zoom
        map.off('zoomend')
      }
    }
  }, [map])

  useEffect(() => {
    if (map) {
      const handleCenterOnLocation = (event: CustomEvent) => {
        const { lat, lng } = event.detail
        map.setView([lat, lng], 18) // Zoom plus proche pour voir le lieu
      }

      window.addEventListener('centerOnLocation', handleCenterOnLocation as EventListener)

      return () => {
        window.removeEventListener('centerOnLocation', handleCenterOnLocation as EventListener)
      }
    }
  }, [map])

  useEffect(() => {
    const handleVREvent = (event: any) => {
      setCurrentModelUrl(event.detail.modelUrl)
      setShowVR(true)
    }

    window.addEventListener('openVR', handleVREvent)
    return () => window.removeEventListener('openVR', handleVREvent)
  }, [])

  useEffect(() => {
    const handleShowRoute = (event: any) => {
      const { lat, lng } = event.detail
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude
          
          // Créer l'itinéraire
          const routingControl = L.Routing.control({
            waypoints: [
              L.latLng(userLat, userLng),
              L.latLng(lat, lng)
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
        })
      }
    }

    window.addEventListener('showRoute', handleShowRoute)
    return () => window.removeEventListener('showRoute', handleShowRoute)
  }, [map])

  return (
    <div className="relative h-full w-full">
      <div id="map" className="h-full w-full" />
      {!userLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 p-4 rounded-lg shadow-lg z-10">
          <p className="text-sm text-gray-300">
            Veuillez autoriser l'accès à votre position pour une meilleure expérience
          </p>
        </div>
      )}
      {showVR && (
        <VRViewer
          modelUrl={currentModelUrl}
          onClose={() => setShowVR(false)}
        />
      )}
    </div>
  )
} 
