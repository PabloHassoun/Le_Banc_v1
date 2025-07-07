import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserBadges } from '@/lib/badgeChecker';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const badges = await getUserBadges(session.user.id);
    
    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}