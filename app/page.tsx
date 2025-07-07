'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      router.push('/home');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Le Banc
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Découvrez et partagez les plus beaux bancs de votre région. 
            Trouvez l'endroit parfait pour vous reposer et profiter du paysage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Rejoindre la communauté
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Se connecter
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-4">Partagez</h3>
              <p className="text-gray-600">
                Photographiez les bancs que vous découvrez et partagez-les avec la communauté
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-4">Explorez</h3>
              <p className="text-gray-600">
                Utilisez la carte interactive pour découvrir les bancs près de chez vous
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🪑</div>
              <h3 className="text-xl font-semibold mb-4">Trouvez</h3>
              <p className="text-gray-600">
                Retrouvez facilement le banc parfait grâce à la géolocalisation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
