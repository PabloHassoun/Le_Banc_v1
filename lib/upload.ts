import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

export async function uploadImage(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Générer un nom de fichier unique
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`
    const filePath = path.join(process.cwd(), 'public/uploads', fileName)

    // Compresser et convertir l'image en WebP
    const processedBuffer = await sharp(buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    // Sauvegarder le fichier
    await writeFile(filePath, processedBuffer)

    return `/uploads/${fileName}`
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    throw new Error('Erreur lors de l\'upload de l\'image')
  }
}

export function validateImageFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return 'Format d\'image non supporté. Utilisez JPEG, PNG ou WebP.'
  }

  if (file.size > maxSize) {
    return 'L\'image est trop volumineuese (max 10MB).'
  }

  return null
}