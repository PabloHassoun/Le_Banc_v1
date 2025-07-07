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

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            benches: true,
            likes: true,
            comments: true,
            userBadges: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image } = body;

    // Validation des données
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Le nom doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: 'Le nom ne peut pas dépasser 50 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si le nom n'est pas déjà utilisé par un autre utilisateur
    const existingUser = await prisma.user.findFirst({
      where: {
        name: name.trim(),
        NOT: {
          id: session.user.id
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur est déjà utilisé' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name: name.trim(),
        ...(image && { image })
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            benches: true,
            likes: true,
            comments: true,
            userBadges: true
          }
        }
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}