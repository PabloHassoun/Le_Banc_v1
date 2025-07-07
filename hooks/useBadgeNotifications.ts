'use client';

import { useState, useCallback } from 'react';
import { BADGE_DEFINITIONS } from '@/lib/badges';

interface BadgeNotificationData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: string;
}

export function useBadgeNotifications() {
  const [notifications, setNotifications] = useState<BadgeNotificationData[]>([]);

  const showBadgeNotification = useCallback((badgeId: string) => {
    const badgeDefinition = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badgeDefinition) return;

    const notification: BadgeNotificationData = {
      id: badgeDefinition.id,
      name: badgeDefinition.name,
      description: badgeDefinition.description,
      icon: badgeDefinition.icon,
      color: badgeDefinition.color,
      rarity: badgeDefinition.rarity
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  const dismissNotification = useCallback((badgeId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== badgeId));
  }, []);

  const checkAndShowNewBadges = useCallback(async () => {
    try {
      const response = await fetch('/api/badges/check', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.newBadges && result.newBadges.length > 0) {
          result.newBadges.forEach((badgeId: string) => {
            showBadgeNotification(badgeId);
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des badges:', error);
    }
  }, [showBadgeNotification]);

  return {
    notifications,
    showBadgeNotification,
    dismissNotification,
    checkAndShowNewBadges
  };
}