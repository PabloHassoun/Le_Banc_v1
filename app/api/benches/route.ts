import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardBadges } from '@/lib/badgeChecker'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '10' // km par défaut

    let benches

    if (lat && lng) {
      // Recherche par proximité géographique
      const radiusInDegrees = parseFloat(radius) / 111 // Approximation: 1 degré ≈ 111 km
      benches = await prisma.bench.findMany({
        where: {
          latitude: {
            gte: parseFloat(lat) - radiusInDegrees,
            lte: parseFloat(lat) + radiusInDegrees
          },
          longitude: {
            gte: parseFloat(lng) - radiusInDegrees,
            lte: parseFloat(lng) + radiusInDegrees
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Tous les bancs
      benches = await prisma.bench.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(benches)
  } catch (error) {
    console.error('Erreur récupération bancs:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { title, description, imageUrl, latitude, longitude, address } = await request.json()

    if (!title || !imageUrl || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    const bench = await prisma.bench.create({
      data: {
        title,
        description,
        imageUrl,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Vérifier et attribuer des badges après création d'un banc
    await checkAndAwardBadges(session.user.id);

    return NextResponse.json(bench, { status: 201 })
  } catch (error) {
    console.error('Erreur création banc:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}