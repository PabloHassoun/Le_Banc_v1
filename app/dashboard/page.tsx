'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Le Banc</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bonjour, {session.user?.name}</span>
              <Button
                variant="outline"
                onClick={() => signOut()}
              >
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenue sur Le Banc !
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Découvrez et partagez les plus beaux bancs de votre région
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Ajouter un banc</h3>
              <p className="text-gray-600 mb-4">
                Partagez un banc que vous avez découvert
              </p>
              <Button onClick={() => router.push('/bench/add')}>
                Ajouter un banc
              </Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Explorer</h3>
              <p className="text-gray-600 mb-4">
                Découvrez les bancs près de chez vous
              </p>
              <Button variant="outline" onClick={() => router.push('/map')}>
                Explorer la carte
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}