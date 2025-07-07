import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const likedBenches = await prisma.like.findMany({
      where: {
        userId: session.user.id
      },
      skip,
      take: limit,
      orderBy: {
        id: 'desc'
      },
      include: {
        bench: {
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
        }
      }
    });

    const totalCount = await prisma.like.count({
      where: {
        userId: session.user.id
      }
    });

    const hasMore = skip + limit < totalCount;

    // Transformer les données pour garder la même structure que les autres APIs
    const benches = likedBenches.map(like => like.bench);

    return NextResponse.json({
      benches,
      hasMore,
      totalCount
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des bancs likés:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}