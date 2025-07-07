'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, User, Trash2, Edit } from 'lucide-react';

interface BenchPost {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: {
    id: string;
    userId: string;
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }[];
  _count: {
    likes: number;
    comments: number;
  };
}

interface UserBenchesProps {
  type: 'owned' | 'liked';
  title: string;
}

export default function UserBenches({ type, title }: UserBenchesProps) {
  const [benches, setBenches] = useState<BenchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint = type === 'owned' ? '/api/user/benches' : '/api/user/liked-benches';

  const fetchBenches = useCallback(async (pageNumber: number = 1) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${endpoint}?page=${pageNumber}&limit=12`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des bancs');
      }
      
      const data = await response.json();
      
      if (pageNumber === 1) {
        setBenches(data.benches);
      } else {
        setBenches(prev => [...prev, ...data.benches]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNumber + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [loading, endpoint]);

  useEffect(() => {
    fetchBenches(1);
  }, [fetchBenches]);

  const handleLike = async (benchId: string) => {
    try {
      const response = await fetch(`/api/benches/${benchId}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setBenches(prev => prev.map(bench => {
          if (bench.id === benchId) {
            const isLiked = bench.likes.some(like => like.userId === bench.user.id);
            return {
              ...bench,
              likes: isLiked 
                ? bench.likes.filter(like => like.userId !== bench.user.id)
                : [...bench.likes, { id: Date.now().toString(), userId: bench.user.id }],
              _count: {
                ...bench._count,
                likes: isLiked ? bench._count.likes - 1 : bench._count.likes + 1
              }
            };
          }
          return bench;
        }));
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && benches.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des bancs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-gray-500">
          {benches.length} banc{benches.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {benches.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🪑</div>
          <p className="text-gray-500">
            {type === 'owned' 
              ? 'Vous n\'avez pas encore ajouté de banc.' 
              : 'Vous n\'avez pas encore liké de banc.'
            }
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {type === 'owned' 
              ? 'Commencez par ajouter votre premier banc !' 
              : 'Explorez le feed pour découvrir des bancs à liker !'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benches.map((bench) => (
              <div key={bench.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={bench.imageUrl}
                    alt={bench.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{bench.title}</h3>
                  
                  {bench.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bench.description}</p>
                  )}
                  
                  {bench.address && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="line-clamp-1">{bench.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{formatDate(bench.createdAt)}</span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {bench._count.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {bench._count.comments}
                      </span>
                    </div>
                  </div>

                  {type === 'owned' && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={() => fetchBenches(page)}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Chargement...' : 'Charger plus'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}