'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Map from '@/components/ui/map'
import { useGeolocation } from '@/hooks/useGeolocation'

interface Bench {
  id: string
  title: string
  description: string | null
  imageUrl: string
  latitude: number
  longitude: number
  address: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
  }
  _count: {
    likes: number
    comments: number
  }
}

export default function MapPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { latitude, longitude, getCurrentPosition, loading: geoLoading } = useGeolocation()

  const [benches, setBenches] = useState<Bench[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]) // Paris par défaut

  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter([latitude, longitude])
      loadBenches(latitude, longitude)
    } else {
      loadBenches()
    }
  }, [latitude, longitude])

  const loadBenches = async (lat?: number, lng?: number) => {
    try {
      setLoading(true)
      
      let url = '/api/benches'
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}&radius=10`
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des bancs')
      }

      const data = await response.json()
      setBenches(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleUseCurrentLocation = () => {
    getCurrentPosition()
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg mb-4">Vous devez être connecté pour voir la carte</p>
          <Button onClick={() => router.push('/auth/signin')}>
            Se connecter
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Carte des bancs</h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                size="sm"
              >
                {geoLoading ? 'Localisation...' : 'Ma position'}
              </Button>
              <Button
                onClick={() => router.push('/bench/add')}
                size="sm"
              >
                Ajouter un banc
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                size="sm"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des bancs...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md z-10">
            {error}
          </div>
        )}

        <div className="h-[calc(100vh-80px)]">
          <Map
            center={mapCenter}
            zoom={13}
            markers={benches.map(bench => ({
              id: bench.id,
              lat: bench.latitude,
              lng: bench.longitude,
              title: bench.title,
              description: bench.description || undefined,
              imageUrl: bench.imageUrl
            }))}
          />
        </div>
      </div>

      {benches.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-lg mb-2">
            {benches.length} banc{benches.length > 1 ? 's' : ''} trouvé{benches.length > 1 ? 's' : ''}
          </h3>
          <p className="text-gray-600 text-sm">
            Cliquez sur un marqueur pour voir les détails
          </p>
        </div>
      )}
    </div>
  )
}