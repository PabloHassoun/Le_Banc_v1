'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapProps {
  center: [number, number]
  zoom?: number
  className?: string
  onLocationSelect?: (lat: number, lng: number) => void
  markers?: Array<{
    id: string
    lat: number
    lng: number
    title: string
    description?: string
    imageUrl?: string
  }>
}

export default function Map({ 
  center, 
  zoom = 13, 
  className = '', 
  onLocationSelect,
  markers = []
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Créer la carte
    const map = L.map(mapRef.current).setView(center, zoom)

    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Gestionnaire de clic pour sélectionner une location
    if (onLocationSelect) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        onLocationSelect(lat, lng)
      })
    }

    // Ajouter les marqueurs
    markers.forEach(marker => {
      const popupContent = `
        <div class="min-w-48">
          <h3 class="font-semibold text-lg mb-2">${marker.title}</h3>
          ${marker.description ? `<p class="text-gray-600 mb-2">${marker.description}</p>` : ''}
          ${marker.imageUrl ? `<img src="${marker.imageUrl}" alt="${marker.title}" class="w-full h-32 object-cover rounded" />` : ''}
        </div>
      `
      
      L.marker([marker.lat, marker.lng])
        .addTo(map)
        .bindPopup(popupContent)
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [center, zoom, onLocationSelect, markers])

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  )
}