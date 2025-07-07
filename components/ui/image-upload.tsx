'use client'

import { useState, useRef } from 'react'
import { Button } from './button'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  onError?: (error: string) => void
  className?: string
}

export default function ImageUpload({ 
  onImageUpload, 
  onError, 
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Créer un aperçu
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload du fichier
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'upload')
      }

      const data = await response.json()
      onImageUpload(data.imageUrl)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      onError?.(errorMessage)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Aperçu" 
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            onClick={handleClick}
            disabled={uploading}
            className="absolute bottom-2 right-2"
            size="sm"
          >
            {uploading ? 'Upload...' : 'Changer'}
          </Button>
        </div>
      ) : (
        <div 
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm">
              {uploading ? 'Upload en cours...' : 'Cliquez pour sélectionner une image'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WebP jusqu'à 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}