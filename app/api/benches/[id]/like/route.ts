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

    const benchId = params.id;
    const userId = session.user.id;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_benchId: {
          userId,
          benchId
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId,
          benchId
        }
      });
      
      // Vérifier et attribuer des badges après un like
      await checkAndAwardBadges(userId);
      
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Erreur lors du like:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}