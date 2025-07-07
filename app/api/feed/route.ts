import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const benches = await prisma.bench.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        likes: {
          select: {
            id: true,
            userId: true
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    const totalCount = await prisma.bench.count();
    const hasMore = skip + limit < totalCount;

    return NextResponse.json({
      benches,
      hasMore,
      totalCount
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du feed:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}