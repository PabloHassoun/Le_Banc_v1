import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkAndAwardBadges } from '@/lib/badgeChecker';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const result = await checkAndAwardBadges(session.user.id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la vérification des badges:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}