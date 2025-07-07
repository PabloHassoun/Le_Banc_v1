'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Feed from '@/components/ui/feed';
import { Plus, Map, User } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/home" className="text-2xl font-bold text-green-600">
                Le Banc
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/home" className="text-gray-700 hover:text-green-600 transition-colors">
                Accueil
              </Link>
              <Link href="/map" className="text-gray-500 hover:text-green-600 transition-colors">
                Carte
              </Link>
              <Link href="/bench/add" className="text-gray-500 hover:text-green-600 transition-colors">
                Ajouter un banc
              </Link>
              <Link href="/dashboard" className="text-gray-500 hover:text-green-600 transition-colors">
                Profil
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link href="/bench/add">
                <Button size="sm" className="hidden sm:flex">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'Utilisateur'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {session.user?.name || 'Utilisateur'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Navigation rapide</h2>
              <nav className="space-y-2">
                <Link href="/map" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Map className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Explorer la carte</span>
                </Link>
                <Link href="/bench/add" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Ajouter un banc</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Mon profil</span>
                </Link>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bienvenue sur Le Banc
              </h1>
              <p className="text-gray-600">
                Découvrez les derniers bancs partagés par la communauté
              </p>
            </div>
            
            <Feed />
          </div>
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 gap-1">
          <Link href="/home" className="flex flex-col items-center justify-center p-3 text-green-600">
            <div className="w-6 h-6 mb-1">🏠</div>
            <span className="text-xs">Accueil</span>
          </Link>
          <Link href="/map" className="flex flex-col items-center justify-center p-3 text-gray-500">
            <Map className="w-6 h-6 mb-1" />
            <span className="text-xs">Carte</span>
          </Link>
          <Link href="/bench/add" className="flex flex-col items-center justify-center p-3 text-gray-500">
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs">Ajouter</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center justify-center p-3 text-gray-500">
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}