'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Comments from '@/components/ui/comments';
import { Heart, MessageCircle, MapPin, User } from 'lucide-react';

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

interface FeedResponse {
  benches: BenchPost[];
  hasMore: boolean;
  totalCount: number;
}

export default function Feed() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BenchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async (pageNumber: number = 1) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/feed?page=${pageNumber}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des posts');
      }
      
      const data: FeedResponse = await response.json();
      
      if (pageNumber === 1) {
        setPosts(data.benches);
      } else {
        setPosts(prev => [...prev, ...data.benches]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNumber + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (session) {
      fetchPosts(1);
    }
  }, [session, fetchPosts]);

  const handleLike = async (benchId: string) => {
    try {
      const response = await fetch(`/api/benches/${benchId}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setPosts(prev => prev.map(post => {
          if (post.id === benchId) {
            const isLiked = post.likes.some(like => like.userId === session?.user?.id);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(like => like.userId !== session?.user?.id)
                : [...post.likes, { id: Date.now().toString(), userId: session?.user?.id || '' }],
              _count: {
                ...post._count,
                likes: isLiked ? post._count.likes - 1 : post._count.likes + 1
              }
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCommentAdded = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          _count: {
            ...post._count,
            comments: post._count.comments + 1
          }
        };
      }
      return post;
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Connectez-vous pour voir le feed</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {posts.map((post) => {
        const isLiked = post.likes.some(like => like.userId === session.user?.id);
        
        return (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {post.user.image ? (
                    <Image
                      src={post.user.image}
                      alt={post.user.name || 'Utilisateur'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {post.user.name || 'Utilisateur anonyme'}
                  </h4>
                  <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              {post.description && (
                <p className="text-gray-700 mb-3">{post.description}</p>
              )}
              
              {post.address && (
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {post.address}
                </div>
              )}
            </div>
            
            <div className="relative aspect-square">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-4">
              <div className="flex items-center space-x-4 mb-3">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Heart 
                    className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span>{post._count.likes}</span>
                </button>
                
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>{post._count.comments}</span>
                </button>
              </div>
              
              {/* Section commentaires */}
              {expandedComments.has(post.id) && (
                <div className="border-t border-gray-100 pt-4">
                  <Comments
                    benchId={post.id}
                    initialComments={post.comments}
                    commentCount={post._count.comments}
                    onCommentAdded={() => handleCommentAdded(post.id)}
                  />
                </div>
              )}
              
              {/* Aperçu des commentaires quand pas étendu */}
              {!expandedComments.has(post.id) && post.comments.length > 0 && (
                <div className="space-y-2">
                  {post.comments.slice(0, 2).map((comment) => (
                    <div key={comment.id} className="flex space-x-2 text-sm">
                      <span className="font-medium">{comment.user.name || 'Anonyme'}:</span>
                      <span className="text-gray-700 line-clamp-1">{comment.content}</span>
                    </div>
                  ))}
                  {post._count.comments > 2 && (
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Voir les {post._count.comments - 2} autres commentaires
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchPosts(page)}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Chargement...' : 'Charger plus'}
          </Button>
        </div>
      )}
      
      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun banc n'a encore été partagé.</p>
          <p className="text-gray-500 mt-2">
            Soyez le premier à partager un banc !
          </p>
        </div>
      )}
    </div>
  );
}