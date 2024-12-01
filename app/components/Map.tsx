'use client'

import { getLocations } from '@/app/services/firebase/locations'
import * as L from 'leaflet'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { getMarkerIcon } from './MapMarkers'

// Coordonnées du centre de Camayenne
const CAMAYENNE_CENTER: [number, number] = [9.5370, -13.6785]

// Types pour les couches de carte
type MapLayer = {
  id: string;
  url: string;
  attribution: string;
  name: string;
}

// Définition des couches disponibles
const MAP_LAYERS: MapLayer[] = [
  {
    id: 'dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors, © CARTO',
    name: 'Mode sombre'
  },
  {
    id: 'standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    name: 'Standard'
  },
  {
    id: 'satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    name: 'Satellite'
  },
  {
    id: 'terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap',
    name: 'Terrain'
  },
  {
    id: 'traffic',
    url: `https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_API_KEY}`,
    attribution: '© Thunderforest',
    name: 'Trafic'
  }
]

// Ajoutez ce type pour les modes de transport
type TransportMode = 'car' | 'foot' | 'bike';

declare module 'leaflet' {
  interface MarkerOptions {
    type?: string;
  }
}

export default function Map() {
  const [map, setMap] = useState<L.Map | null>(null)
  const [routingControl, setRoutingControl] = useState<any>(null)
  const [markers, setMarkers] = useState<L.Marker[]>([])
  const [userMarker, setUserMarker] = useState<L.Marker | null>(null)
  const [currentLayer, setCurrentLayer] = useState<L.TileLayer | null>(null)
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    isVisible: boolean;
    mode: TransportMode;
  } | null>(null);
  const [activeTransportMode, setActiveTransportMode] = useState<TransportMode>('car');

  // Gestion du zoom
  useEffect(() => {
    if (!map) return

    // Gestionnaire pour le zoom
    const handleZoomIn = () => {
      const currentZoom = map.getZoom()
      map.setZoom(currentZoom + 1)
    }

    const handleZoomOut = () => {
      const currentZoom = map.getZoom()
      map.setZoom(currentZoom - 1)
    }

    // Écouter les changements de zoom pour mettre à jour l'affichage
    map.on('zoomend', () => {
      const currentZoom = map.getZoom()
      window.dispatchEvent(new CustomEvent('zoomChange', {
        detail: { zoom: Math.round(currentZoom) }
      }))
    })

    window.addEventListener('zoomIn', handleZoomIn)
    window.addEventListener('zoomOut', handleZoomOut)

    return () => {
      window.removeEventListener('zoomIn', handleZoomIn)
      window.removeEventListener('zoomOut', handleZoomOut)
      map.off('zoomend')
    }
  }, [map])

  // useEffect principal pour l'initialisation de la carte
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mapInstance = L.map('map').setView(CAMAYENNE_CENTER, 15)

    // Changer la couche par défaut pour le mode sombre
    const defaultLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      maxZoom: 19
    }).addTo(mapInstance)

    setMap(mapInstance)
    setCurrentLayer(defaultLayer)

    // Ajouter le cercle de délimitation de Camayenne
    const camayenneRadius = 2500 // augmenté à 2.5km

    // Cercle principal
    L.circle(CAMAYENNE_CENTER, {
      radius: camayenneRadius,
      color: '#4A90E2',
      fillColor: '#4A90E2',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '5, 10', // Ligne pointillée
    }).addTo(mapInstance)

    // Cercle intérieur avec effet de pulsation
    const pulsingCircle = L.circle(CAMAYENNE_CENTER, {
      radius: camayenneRadius * 0.8, // 80% du rayon principal
      color: '#4A90E2',
      fillColor: '#4A90E2',
      fillOpacity: 0.2,
      weight: 1,
      className: 'pulsing-circle'
    }).addTo(mapInstance)

    // Popup pour le cercle avec plus d'informations
    pulsingCircle.bindPopup(`
      <div class="custom-popup">
        <div class="popup-image relative">
          <img src="/img.jpg" alt="Camayenne" class="w-full h-32 object-cover rounded-t-lg"/>
          <div class="absolute top-2 left-2">
            <span class="px-2 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-xs rounded-full">
              Zone résidentielle
            </span>
          </div>
        </div>
        <div class="p-4 bg-gray-800">
          <h3 class="text-lg font-semibold text-white">Zone de Camayenne</h3>
          <p class="text-gray-300 text-sm mb-2">Rayon : 2.5 km</p>
          <p class="text-gray-300 text-sm">Un quartier résidentiel et commercial prisé de Conakry, connu pour ses restaurants, hôtels et commerces.</p>
          <div class="mt-3 text-gray-400 text-sm">
            <div class="flex items-center mb-1">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              Conakry, Guinée
            </div>
          </div>
        </div>
      </div>
    `, {
      className: 'custom-popup',
      maxWidth: 300
    })

    // Charger et afficher les marqueurs
    const loadMarkers = async () => {
      try {
        const locations = await getLocations()
        
        const newMarkers = locations.map(location => {
          const icon = L.divIcon({
            className: 'custom-div-icon',
            html: getMarkerIcon(location.type),
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })

          const marker = L.marker([location.latitude, location.longitude], { 
            icon,
            type: location.type
          }).addTo(mapInstance)

          // Ajouter le popup
          marker.bindPopup(createPopupContent(location), {
            maxWidth: 300,
            className: 'custom-popup'
          })

          return marker
        })

        setMarkers(newMarkers)
      } catch (error) {
        console.error('Erreur lors du chargement des marqueurs:', error)
      }
    }

    loadMarkers()

    // Écouter les événements du Sidebar
    const handleLocateUser = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords
          mapInstance.setView([latitude, longitude], 16)

          // Supprimer l'ancien marqueur de position s'il existe
          if (userMarker) {
            userMarker.remove()
          }

          // Créer un nouveau marqueur pour la position de l'utilisateur
          const newUserMarker = L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div style="
                  background-color: #4A90E2;
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  border: 2px solid #FFFFFF;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5);
                "></div>
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  border: 2px solid #4A90E2;
                  animation: pulse 2s infinite;
                "></div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          }).addTo(mapInstance)

          // Ajouter un popup à la position
          newUserMarker.bindPopup(`
            <div class="custom-popup">
              <div class="popup-image relative">
                <img src="/img.jpg" alt="Ma position" class="w-full h-32 object-cover rounded-t-lg"/>
                <div class="absolute top-2 left-2">
                  <span class="px-2 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-xs rounded-full">
                    Ma position
                  </span>
                </div>
              </div>
              <div class="p-4 bg-gray-800">
                <h3 class="text-lg font-semibold text-white">Votre position actuelle</h3>
                <p class="text-gray-300 text-sm mb-3">Vous êtes ici</p>
                <div class="flex items-center text-gray-400 text-sm">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  Coordonnées : ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
                </div>
              </div>
            </div>
          `, {
            className: 'custom-popup',
            maxWidth: 300
          }).openPopup()

          setUserMarker(newUserMarker)
        }, (error) => {
          console.error('Erreur de géolocalisation:', error)
          alert('Veuillez autoriser l\'accès à votre position pour utiliser cette fonctionnalité.')
        })
      }
    }

    const handleCenterOnCamayenne = (event: Event) => {
      console.log('Centrage sur Camayenne...')
      mapInstance.setView(CAMAYENNE_CENTER, 15)
      
      // Ajouter un marqueur temporaire avec animation
      const marker = L.marker(CAMAYENNE_CENTER, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background-color: #4A90E2;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: 2px solid #FFFFFF;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid #4A90E2;
              animation: pulse 2s infinite;
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(mapInstance)

      // Popup pour Camayenne
      marker.bindPopup(`
        <div class="custom-popup">
          <div class="popup-image relative">
            <img src="/img.jpg" alt="Camayenne" class="w-full h-32 object-cover rounded-t-lg"/>
            <div class="absolute top-2 left-2">
              <span class="px-2 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-xs rounded-full">
                Point central
              </span>
            </div>
          </div>
          <div class="p-4 bg-gray-800">
            <h3 class="text-lg font-semibold text-white">Point central de Camayenne</h3>
            <p class="text-gray-300 text-sm mb-3">Centre névralgique du quartier de Camayenne</p>
            <div class="flex items-center text-gray-400 text-sm mb-2">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              Coordonnées : ${CAMAYENNE_CENTER[0].toFixed(4)}, ${CAMAYENNE_CENTER[1].toFixed(4)}
            </div>
            <div class="flex items-center text-gray-400 text-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Point de référence pour la navigation
            </div>
          </div>
        </div>
      `, {
        className: 'custom-popup',
        maxWidth: 300
      }).openPopup()

      // Supprimer le marqueur après quelques secondes
      setTimeout(() => {
        marker.remove()
      }, 3000)
    }

    window.addEventListener('locateUser', handleLocateUser)
    window.addEventListener('centerOnCamayenne', handleCenterOnCamayenne)

    // Écouter les changements de couche
    const handleLayerChange = (event: CustomEvent) => {
      const { layerId } = event.detail
      let layerUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' // Mode sombre par défaut
      let attribution = '© OpenStreetMap contributors, © CARTO'

      switch (layerId) {
        case 'standard':
          layerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution = '© OpenStreetMap contributors'
          break
        case 'satellite':
          layerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          attribution = '© Esri'
          break
        case 'terrain':
          layerUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
          attribution = '© OpenTopoMap'
          break
        case 'traffic':
          layerUrl = `https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_API_KEY}`
          attribution = '© Thunderforest'
          break
      }

      // Supprimer la couche actuelle si elle existe
      if (currentLayer) {
        currentLayer.remove()
      }

      // Ajouter la nouvelle couche
      const newLayer = L.tileLayer(layerUrl, {
        attribution: attribution,
        maxZoom: 19
      }).addTo(mapInstance)
      
      setCurrentLayer(newLayer)
    }

    window.addEventListener('changeMapLayer', handleLayerChange as EventListener)

    return () => {
      if (routingControl) {
        mapInstance.removeControl(routingControl)
      }
      markers.forEach(marker => marker.remove())
      mapInstance.remove()
      window.removeEventListener('locateUser', handleLocateUser)
      window.removeEventListener('centerOnCamayenne', handleCenterOnCamayenne)
      window.removeEventListener('changeMapLayer', handleLayerChange as EventListener)
    }
  }, [])

  // Gestion des itinéraires
  useEffect(() => {
    if (!map) return

    const handleShowRoute = (event: any) => {
      const { lat, lng } = event.detail
      if (!navigator.geolocation) return

      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude

        if (routingControl) {
          map.removeControl(routingControl)
        }

        // Icône pour la position de l'utilisateur (départ)
        const startIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background-color: #22C55E;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: 2px solid #FFFFFF;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid #22C55E;
              animation: pulse 2s infinite;
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // Icône pour la destination
        const destinationIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background-color: #EF4444;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: 2px solid #FFFFFF;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid #EF4444;
              animation: pulse 2s infinite;
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const newRoutingControl = (L as any).Routing.control({
          waypoints: [
            L.latLng(userLat, userLng),
            L.latLng(lat, lng)
          ],
          routeWhileDragging: true,
          lineOptions: {
            styles: [{ color: '#4A90E2', weight: 4 }]
          },
          router: (L as any).Routing.osrmv1({
            profile: activeTransportMode === 'car' ? 'driving' : 
                    activeTransportMode === 'bike' ? 'cycling' : 
                    'walking'
          }),
          show: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          createMarker: function(i: number, waypoint: any) {
            return L.marker(waypoint.latLng, { 
              icon: i === 0 ? startIcon : destinationIcon 
            });
          }
        }).addTo(map);

        // Écouter les événements de route
        newRoutingControl.on('routesfound', (e: any) => {
          const routes = e.routes;
          const route = routes[0]; // Premier itinéraire

          // Convertir la distance en km si > 1000m
          const distance = route.summary.totalDistance > 1000
            ? `${(route.summary.totalDistance / 1000).toFixed(1)} km`
            : `${route.summary.totalDistance} m`;

          // Convertir la durée en minutes
          const duration = Math.round(route.summary.totalTime / 60);
          
          // Mettre à jour les informations d'itinéraire
          setRouteInfo({
            distance,
            duration: `${duration} min`,
            isVisible: true,
            mode: 'car'
          });
        });

        setRoutingControl(newRoutingControl)
      })
    }

    window.addEventListener('showRoute', handleShowRoute)
    return () => window.removeEventListener('showRoute', handleShowRoute)
  }, [map, routingControl])

  // Ajouter ce useEffect pour gérer le centrage sur un lieu
  useEffect(() => {
    if (!map) return

    const handleCenterOnLocation = (event: CustomEvent) => {
      const { lat, lng, showPopup } = event.detail
      map.setView([lat, lng], 17)

      // Trouver le marqueur correspondant aux coordonnées
      const targetMarker = markers.find(marker => {
        const position = marker.getLatLng()
        return position.lat === lat && position.lng === lng
      })

      // Si on trouve le marqueur et qu'on doit montrer le popup
      if (targetMarker && showPopup) {
        targetMarker.openPopup()
      }
    }

    window.addEventListener('centerOnLocation', handleCenterOnLocation as EventListener)

    return () => {
      window.removeEventListener('centerOnLocation', handleCenterOnLocation as EventListener)
    }
  }, [map, markers])

  // Fonction pour créer le contenu du popup
  const createPopupContent = (location: any) => {
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
          ${location.address ? `
            <div class="flex items-center text-gray-400 text-sm mb-2">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              ${location.address}
            </div>
          ` : ''}
          ${location.phone ? `
            <div class="flex items-center text-gray-400 text-sm mb-2">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              ${location.phone}
            </div>
          ` : ''}
          ${location.openingHours ? `
            <div class="flex items-center text-gray-400 text-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              ${location.openingHours}
            </div>
          ` : ''}
          <div class="flex gap-2 mt-4">
            <button 
              onclick='window.dispatchEvent(new CustomEvent("showRoute", { 
                detail: { 
                  lat: ${location.latitude}, 
                  lng: ${location.longitude}
                }
              }))'
              class="bg-blue-500 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-600 transition-colors flex-1"
            >
              Itinéraire
            </button>
            <button 
              onclick='window.dispatchEvent(new CustomEvent("showLocationDetails", { 
                detail: ${JSON.stringify(location)}
              }))'
              class="bg-gray-700 text-white px-3 py-1 rounded-full text-xs hover:bg-gray-600 transition-colors flex-1"
            >
              Plus de détails
            </button>
          </div>
        </div>
      </div>
    `
  }

  useEffect(() => {
    if (routingControl && map) {
      // Recalculer l'itinéraire avec le nouveau mode de transport
      routingControl.getRouter().options.profile = 
        activeTransportMode === 'car' ? 'driving' : 
        activeTransportMode === 'bike' ? 'cycling' : 
        'walking';
      routingControl.route();
    }
  }, [activeTransportMode, routingControl, map]);

  // Ajoutez cette fonction de fermeture
  const closeRouteInfo = () => {
    setRouteInfo(null);
    if (routingControl && map) {
      map.removeControl(routingControl);
      setRoutingControl(null);
    }
  };

  // Dans le useEffect principal, ajoutez l'écouteur d'événements pour les filtres
  useEffect(() => {
    if (!map) return;

    const handleFilterLocations = (event: CustomEvent) => {
      const { activeTypes } = event.detail;
      
      markers.forEach(marker => {
        const locationType = marker.options.type;
        if (locationType) {
          if (activeTypes.includes(locationType)) {
            marker.addTo(map);
          } else {
            marker.remove();
          }
        }
      });
    };

    window.addEventListener('filterLocations', handleFilterLocations as EventListener);

    return () => {
      window.removeEventListener('filterLocations', handleFilterLocations as EventListener);
    };
  }, [map, markers]);

  return (
    <div className="relative h-full w-full">
      <div id="map" className="h-full w-full z-0" />
      
      {/* Menu d'informations d'itinéraire */}
      {routeInfo && routeInfo.isVisible && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {routeInfo.distance}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {routeInfo.duration}
                </span>
              </div>
              <button
                onClick={closeRouteInfo}
                className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTransportMode('car')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded text-xs ${
                  activeTransportMode === 'car'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                Voiture
              </button>
              <button
                onClick={() => setActiveTransportMode('foot')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded text-xs ${
                  activeTransportMode === 'foot'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14h.01M16 17l-4-4-4 4M4 17l4-4" />
                </svg>
                À pied
              </button>
              <button
                onClick={() => setActiveTransportMode('bike')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded text-xs ${
                  activeTransportMode === 'bike'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16a3 3 0 100-6 3 3 0 000 6zM7 16a3 3 0 100-6 3 3 0 000 6zM7 13h10" />
                </svg>
                Vélo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 