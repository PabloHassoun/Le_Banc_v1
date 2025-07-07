export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  criteria: {
    type: string;
    target: number;
    field?: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-bench',
    name: 'Premier Banc',
    description: 'Félicitations ! Vous avez ajouté votre premier banc.',
    icon: '🪑',
    color: '#10B981',
    category: 'Découverte',
    criteria: {
      type: 'bench_count',
      target: 1
    },
    rarity: 'common'
  },
  {
    id: 'bench-collector',
    name: 'Collectionneur',
    description: 'Vous avez ajouté 10 bancs à votre collection.',
    icon: '📚',
    color: '#3B82F6',
    category: 'Collection',
    criteria: {
      type: 'bench_count',
      target: 10
    },
    rarity: 'uncommon'
  },
  {
    id: 'bench-master',
    name: 'Maître des Bancs',
    description: 'Impressionnant ! 50 bancs ajoutés.',
    icon: '👑',
    color: '#F59E0B',
    category: 'Collection',
    criteria: {
      type: 'bench_count',
      target: 50
    },
    rarity: 'rare'
  },
  {
    id: 'bench-legend',
    name: 'Légende des Bancs',
    description: 'Vous êtes une légende ! 100 bancs ajoutés.',
    icon: '🏆',
    color: '#8B5CF6',
    category: 'Collection',
    criteria: {
      type: 'bench_count',
      target: 100
    },
    rarity: 'epic'
  },
  {
    id: 'city-explorer',
    name: 'Explorateur Urbain',
    description: 'Vous avez découvert des bancs dans 5 villes différentes.',
    icon: '🏙️',
    color: '#06B6D4',
    category: 'Exploration',
    criteria: {
      type: 'unique_cities',
      target: 5,
      field: 'address'
    },
    rarity: 'uncommon'
  },
  {
    id: 'globe-trotter',
    name: 'Globe-Trotter',
    description: 'Vous avez exploré 20 villes différentes !',
    icon: '🌍',
    color: '#EF4444',
    category: 'Exploration',
    criteria: {
      type: 'unique_cities',
      target: 20,
      field: 'address'
    },
    rarity: 'rare'
  },
  {
    id: 'early-bird',
    name: 'Lève-tôt',
    description: 'Vous avez ajouté un banc avant 8h du matin.',
    icon: '🌅',
    color: '#F97316',
    category: 'Temps',
    criteria: {
      type: 'early_morning',
      target: 8
    },
    rarity: 'uncommon'
  },
  {
    id: 'night-owl',
    name: 'Oiseau de Nuit',
    description: 'Vous avez ajouté un banc après 22h.',
    icon: '🦉',
    color: '#6366F1',
    category: 'Temps',
    criteria: {
      type: 'late_night',
      target: 22
    },
    rarity: 'uncommon'
  },
  {
    id: 'social-butterfly',
    name: 'Papillon Social',
    description: 'Vous avez reçu 100 likes sur vos bancs.',
    icon: '🦋',
    color: '#EC4899',
    category: 'Social',
    criteria: {
      type: 'total_likes',
      target: 100
    },
    rarity: 'rare'
  },
  {
    id: 'influencer',
    name: 'Influenceur',
    description: 'Vous avez reçu 500 likes sur vos bancs !',
    icon: '⭐',
    color: '#F59E0B',
    category: 'Social',
    criteria: {
      type: 'total_likes',
      target: 500
    },
    rarity: 'epic'
  },
  {
    id: 'first-comment',
    name: 'Premier Commentaire',
    description: 'Vous avez écrit votre premier commentaire.',
    icon: '💬',
    color: '#10B981',
    category: 'Social',
    criteria: {
      type: 'comment_count',
      target: 1
    },
    rarity: 'common'
  },
  {
    id: 'commenter',
    name: 'Commentateur',
    description: 'Vous avez écrit 10 commentaires.',
    icon: '📝',
    color: '#14B8A6',
    category: 'Social',
    criteria: {
      type: 'comment_count',
      target: 10
    },
    rarity: 'uncommon'
  },
  {
    id: 'chatty',
    name: 'Bavard',
    description: 'Vous avez écrit 50 commentaires.',
    icon: '🗣️',
    color: '#3B82F6',
    category: 'Social',
    criteria: {
      type: 'comment_count',
      target: 50
    },
    rarity: 'rare'
  },
  {
    id: 'conversation-starter',
    name: 'Lanceur de Conversation',
    description: 'Vous avez écrit 100 commentaires.',
    icon: '🎤',
    color: '#8B5CF6',
    category: 'Social',
    criteria: {
      type: 'comment_count',
      target: 100
    },
    rarity: 'epic'
  },
  {
    id: 'streak-week',
    name: 'Série Hebdomadaire',
    description: 'Vous avez ajouté au moins un banc par jour pendant 7 jours.',
    icon: '🔥',
    color: '#DC2626',
    category: 'Régularité',
    criteria: {
      type: 'daily_streak',
      target: 7
    },
    rarity: 'rare'
  },
  {
    id: 'photographer',
    name: 'Photographe',
    description: 'Vous avez partagé 25 photos de bancs.',
    icon: '📸',
    color: '#7C3AED',
    category: 'Créativité',
    criteria: {
      type: 'photo_count',
      target: 25
    },
    rarity: 'uncommon'
  },
  {
    id: 'seasonal-summer',
    name: 'Banc d\'Été',
    description: 'Vous avez ajouté un banc pendant l\'été.',
    icon: '☀️',
    color: '#F59E0B',
    category: 'Saison',
    criteria: {
      type: 'seasonal',
      target: 1,
      field: 'summer'
    },
    rarity: 'common'
  },
  {
    id: 'seasonal-winter',
    name: 'Banc d\'Hiver',
    description: 'Vous avez ajouté un banc pendant l\'hiver.',
    icon: '❄️',
    color: '#06B6D4',
    category: 'Saison',
    criteria: {
      type: 'seasonal',
      target: 1,
      field: 'winter'
    },
    rarity: 'common'
  },
  {
    id: 'speed-demon',
    name: 'Rapide comme l\'Éclair',
    description: 'Vous avez ajouté 5 bancs en une journée.',
    icon: '⚡',
    color: '#FBBF24',
    category: 'Performance',
    criteria: {
      type: 'daily_count',
      target: 5
    },
    rarity: 'rare'
  }
];

export function getBadgeRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return '#6B7280';
    case 'uncommon':
      return '#10B981';
    case 'rare':
      return '#3B82F6';
    case 'epic':
      return '#8B5CF6';
    case 'legendary':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
}

export function getBadgeRarityName(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'Commun';
    case 'uncommon':
      return 'Peu commun';
    case 'rare':
      return 'Rare';
    case 'epic':
      return 'Épique';
    case 'legendary':
      return 'Légendaire';
    default:
      return 'Commun';
  }
}