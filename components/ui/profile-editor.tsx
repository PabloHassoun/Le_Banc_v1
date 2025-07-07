'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { User, Camera, Save, X } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  _count: {
    benches: number;
    likes: number;
    comments: number;
    userBadges: number;
  };
}

interface ProfileEditorProps {
  onProfileUpdate?: (profile: UserProfile) => void;
}

export default function ProfileEditor({ onProfileUpdate }: ProfileEditorProps) {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    image: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData({
          name: data.user.name || '',
          image: data.user.image || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          image: formData.image || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setProfile(data.user);
      setEditing(false);
      setSuccess('Profil mis à jour avec succès !');
      
      // Mettre à jour la session
      await update({
        name: data.user.name,
        image: data.user.image
      });

      if (onProfileUpdate) {
        onProfileUpdate(data.user);
      }

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setError(null);

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.imageUrl;
        console.log('Image uploadée:', imageUrl); // Debug
        setFormData(prev => ({
          ...prev,
          image: imageUrl
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erreur lors du chargement du profil</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Mon Profil</h2>
        {!editing && (
          <Button onClick={() => setEditing(true)} variant="outline">
            Modifier
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                ) : formData.image ? (
                  <Image
                    src={formData.image}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                    key={formData.image} // Force re-render when image changes
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label className={`absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && !uploadingImage) {
                      handleImageUpload(file);
                    }
                  }}
                />
              </label>
            </div>
            {uploadingImage && (
              <p className="text-sm text-gray-500">Upload en cours...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Votre nom d'utilisateur"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setFormData({
                  name: profile.name || '',
                  image: profile.image || ''
                });
                setError(null);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name || 'Utilisateur'}
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{profile.name || 'Utilisateur anonyme'}</h3>
              <p className="text-gray-500">{profile.email}</p>
              <p className="text-sm text-gray-400">Membre depuis le {formatDate(profile.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{profile._count.benches}</div>
              <div className="text-sm text-gray-600">Bancs ajoutés</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{profile._count.likes}</div>
              <div className="text-sm text-gray-600">Likes donnés</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{profile._count.comments}</div>
              <div className="text-sm text-gray-600">Commentaires</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{profile._count.userBadges}</div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}