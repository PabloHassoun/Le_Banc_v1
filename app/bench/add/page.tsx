'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ImageUpload from '@/components/ui/image-upload'
import Map from '@/components/ui/map'
import { useGeolocation, reverseGeocode } from '@/hooks/useGeolocation'

export default function AddBench() {
  const { data: session } = useSession()
  const router = useRouter()
  const { latitude, longitude, getCurrentPosition, loading: geoLoading } = useGeolocation()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    latitude: latitude || 48.8566,
    longitude: longitude || 2.3522,
    address: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleLocationSelect = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
    
    try {
      const address = await reverseGeocode(lat, lng)
      setFormData(prev => ({ ...prev, address }))
    } catch (error) {
      console.error('Erreur géocodage:', error)
    }
  }

  const handleUseCurrentLocation = () => {
    getCurrentPosition()
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }))
    setErrors(prev => ({ ...prev, imageUrl: '' }))
  }

  const handleImageError = (error: string) => {
    setErrors(prev => ({ ...prev, imageUrl: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis'
    if (!formData.imageUrl) newErrors.imageUrl = 'Une image est requise'
    if (!formData.latitude || !formData.longitude) newErrors.location = 'La localisation est requise'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/benches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création')
      }

      router.push('/dashboard?success=Banc ajouté avec succès')
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Erreur inconnue' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Vous devez être connecté pour ajouter un banc</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Ajouter un banc</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Titre *"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  error={errors.title}
                  placeholder="Ex: Banc avec vue sur la Seine"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Décrivez ce qui rend ce banc spécial..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo *
                  </label>
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onError={handleImageError}
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-red-600 mt-1">{errors.imageUrl}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation *
                  </label>
                  <div className="mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUseCurrentLocation}
                      disabled={geoLoading}
                      className="w-full"
                    >
                      {geoLoading ? 'Localisation...' : 'Utiliser ma position actuelle'}
                    </Button>
                  </div>
                  
                  <div className="h-64 rounded-lg overflow-hidden border">
                    <Map
                      center={[formData.latitude, formData.longitude]}
                      onLocationSelect={handleLocationSelect}
                      markers={[{
                        id: 'selected',
                        lat: formData.latitude,
                        lng: formData.longitude,
                        title: 'Position sélectionnée'
                      }]}
                    />
                  </div>
                  
                  {errors.location && (
                    <p className="text-sm text-red-600 mt-1">{errors.location}</p>
                  )}
                </div>

                <Input
                  label="Adresse"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Adresse automatique ou personnalisée"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Ajout...' : 'Ajouter le banc'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}