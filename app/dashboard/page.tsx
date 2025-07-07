'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BadgeDisplay, BadgeStats } from '@/components/ui/badges'
import { useBadgeNotifications } from '@/hooks/useBadgeNotifications'
import { BadgeNotification } from '@/components/ui/badges'
import UserBenches from '@/components/ui/user-benches'
import ProfileEditor from '@/components/ui/profile-editor'
import { User, Trophy, Heart, Plus, Settings } from 'lucide-react'
import Link from 'next/link'

type TabType = 'profile' | 'badges' | 'my-benches' | 'liked-benches';

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const { notifications, dismissNotification, checkAndShowNewBadges } = useBadgeNotifications()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session) {
      fetchBadges()
      checkAndShowNewBadges()
    }
  }, [session, checkAndShowNewBadges])

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges')
      if (response.ok) {
        const data = await response.json()
        setBadges(data.badges)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    {
      id: 'profile' as TabType,
      name: 'Profil',
      icon: User,
      description: 'Gérer mon profil'
    },
    {
      id: 'badges' as TabType,
      name: 'Badges',
      icon: Trophy,
      description: 'Mes récompenses'
    },
    {
      id: 'my-benches' as TabType,
      name: 'Mes Bancs',
      icon: Plus,
      description: 'Bancs que j\'ai ajoutés'
    },
    {
      id: 'liked-benches' as TabType,
      name: 'Bancs Likés',
      icon: Heart,
      description: 'Bancs que j\'ai aimés'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileEditor onProfileUpdate={() => {}} />
      case 'badges':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Mes Badges</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des badges...</p>
                </div>
              ) : (
                <BadgeDisplay badges={badges} showAll />
              )}
            </div>
            {!loading && <BadgeStats badges={badges} />}
          </div>
        )
      case 'my-benches':
        return <UserBenches type="owned" title="Mes Bancs" />
      case 'liked-benches':
        return <UserBenches type="liked" title="Bancs que j'ai Likés" />
      default:
        return null
    }
  }

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
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/home" className="text-2xl font-bold text-green-600">
                Le Banc
              </Link>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Dashboard</h1>
            <p className="text-gray-600">Gérez votre profil, vos bancs et vos badges</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar avec onglets */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold mb-4">Navigation</h2>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{tab.name}</div>
                          <div className="text-xs text-gray-500">{tab.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions rapides</h3>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => router.push('/bench/add')}
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un banc
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/home')}
                      size="sm"
                      className="w-full"
                    >
                      Voir le feed
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-3">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Notifications de badges */}
      {notifications.map((notification) => (
        <BadgeNotification
          key={notification.id}
          badge={notification}
          onClose={() => dismissNotification(notification.id)}
        />
      ))}
    </>
  )
}