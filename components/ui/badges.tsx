"use client";

import { getBadgeRarityColor, getBadgeRarityName } from "@/lib/badges";
import { Award, Badge, Crown, Sparkles, Star, Trophy } from "lucide-react";
import { useEffect } from "react";

interface UserBadge {
  id: string;
  unlockedAt: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    category: string;
    rarity: string;
  };
}

interface BadgeDisplayProps {
  badges: UserBadge[];
  showAll?: boolean;
}

export function BadgeDisplay({ badges, showAll = false }: BadgeDisplayProps) {
  const displayedBadges = showAll ? badges : badges.slice(0, 6);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return <Badge className="w-4 h-4" />;
      case "uncommon":
        return <Award className="w-4 h-4" />;
      case "rare":
        return <Star className="w-4 h-4" />;
      case "epic":
        return <Trophy className="w-4 h-4" />;
      case "legendary":
        return <Crown className="w-4 h-4" />;
      default:
        return <Badge className="w-4 h-4" />;
    }
  };

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🏆</div>
        <p className="text-gray-500">Aucun badge débloqué pour le moment</p>
        <p className="text-gray-400 text-sm mt-2">
          Ajoutez des bancs pour débloquer vos premiers badges !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedBadges.map((userBadge) => (
          <div
            key={userBadge.id}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{userBadge.badge.icon}</div>
              <h3 className="font-semibold text-sm mb-1">
                {userBadge.badge.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {userBadge.badge.description}
              </p>

              <div className="flex items-center justify-center space-x-1 mb-2">
                <div
                  style={{ color: getBadgeRarityColor(userBadge.badge.rarity) }}
                >
                  {getRarityIcon(userBadge.badge.rarity)}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: getBadgeRarityColor(userBadge.badge.rarity) }}
                >
                  {getBadgeRarityName(userBadge.badge.rarity)}
                </span>
              </div>

              <div className="text-xs text-gray-400">
                {new Date(userBadge.unlockedAt).toLocaleDateString("fr-FR")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!showAll && badges.length > 6 && (
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            +{badges.length - 6} badges supplémentaires
          </p>
        </div>
      )}
    </div>
  );
}

export function BadgeStats({ badges }: { badges: UserBadge[] }) {
  const stats = badges.reduce((acc, badge) => {
    acc[badge.badge.rarity] = (acc[badge.badge.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = badges.reduce((acc, badge) => {
    acc[badge.badge.category] = (acc[badge.badge.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
        Statistiques des badges
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Par rareté</h4>
          <div className="space-y-1">
            {Object.entries(stats).map(([rarity, count]) => (
              <div key={rarity} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {getBadgeRarityName(rarity)}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: getBadgeRarityColor(rarity) }}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Par catégorie</h4>
          <div className="space-y-1">
            {Object.entries(categories).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{category}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total des badges</span>
          <span className="text-xl font-bold text-green-600">
            {badges.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export function BadgeNotification({
  badge,
  onClose,
}: {
  badge: {
    icon: string;
    name: string;
    description: string;
  };
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{badge.icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-green-600">
            Nouveau badge débloqué !
          </h4>
          <p className="text-sm font-medium">{badge.name}</p>
          <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
    </div>
  );
}
