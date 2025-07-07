'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Send, User, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommentsProps {
  benchId: string;
  initialComments: Comment[];
  commentCount: number;
  onCommentAdded?: () => void;
}

export default function Comments({ benchId, initialComments, commentCount, onCommentAdded }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(commentCount > 3);
  const [error, setError] = useState<string | null>(null);

  const loadMoreComments = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/benches/${benchId}/comments?page=${page + 1}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setComments(prev => [...prev, ...data.comments]);
        setHasMore(data.hasMore);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('Vous devez être connecté pour commenter');
      return;
    }

    if (!newComment.trim()) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    if (newComment.trim().length > 500) {
      setError('Le commentaire ne peut pas dépasser 500 caractères');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/benches/${benchId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        if (onCommentAdded) {
          onCommentAdded();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de l\'ajout du commentaire');
      }
    } catch (error) {
      setError('Erreur lors de l\'ajout du commentaire');
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    } finally {
      setSubmitting(false);
    }
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

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const remainingCount = Math.max(0, commentCount - displayedComments.length);

  return (
    <div className="space-y-4">
      {/* Formulaire d'ajout de commentaire */}
      {session && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'Vous'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Écrivez un commentaire..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                maxLength={500}
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500 caractères
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !newComment.trim()}
                  className="ml-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Send className="w-4 h-4 mr-1" />
                  )}
                  {submitting ? 'Envoi...' : 'Publier'}
                </Button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </form>
      )}

      {/* Liste des commentaires */}
      {displayedComments.length > 0 && (
        <div className="space-y-3">
          {displayedComments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {comment.user.image ? (
                  <Image
                    src={comment.user.image}
                    alt={comment.user.name || 'Utilisateur'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.user.name || 'Utilisateur anonyme'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boutons pour voir plus/moins de commentaires */}
      {(hasMore || (!showAllComments && commentCount > 3)) && (
        <div className="flex justify-center">
          {!showAllComments && commentCount > 3 ? (
            <button
              onClick={() => {
                setShowAllComments(true);
                if (comments.length <= 3 && hasMore) {
                  loadMoreComments();
                }
              }}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Voir les {remainingCount} commentaires restants</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          ) : (
            <>
              {hasMore && (
                <button
                  onClick={loadMoreComments}
                  disabled={loading}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm mr-4"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                  ) : (
                    <span>Charger plus de commentaires</span>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowAllComments(false)}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
              >
                <span>Réduire</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Message si pas de commentaires */}
      {comments.length === 0 && (
        <div className="text-center py-4">
          <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
          {session && (
            <p className="text-gray-400 text-xs mt-1">Soyez le premier à commenter !</p>
          )}
        </div>
      )}
    </div>
  );
}