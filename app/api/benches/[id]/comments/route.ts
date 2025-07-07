import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAndAwardBadges } from '@/lib/badgeChecker';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu du commentaire est requis' },
        { status: 400 }
      );
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        { error: 'Le commentaire ne peut pas dépasser 500 caractères' },
        { status: 400 }
      );
    }

    const benchId = params.id;
    const userId = session.user.id;

    // Vérifier que le banc existe
    const bench = await prisma.bench.findUnique({
      where: { id: benchId }
    });

    if (!bench) {
      return NextResponse.json({ error: 'Banc non trouvé' }, { status: 404 });
    }

    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        benchId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Vérifier et attribuer des badges après avoir commenté
    await checkAndAwardBadges(userId);

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const benchId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { benchId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    const totalCount = await prisma.comment.count({
      where: { benchId }
    });

    const hasMore = skip + limit < totalCount;

    return NextResponse.json({
      comments,
      hasMore,
      totalCount
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}