import { prisma } from '@/lib/prisma';
import { BADGE_DEFINITIONS, BadgeDefinition } from './badges';

interface BadgeCheckResult {
  newBadges: string[];
  updatedBadges: string[];
}

export async function checkAndAwardBadges(userId: string): Promise<BadgeCheckResult> {
  const newBadges: string[] = [];
  const updatedBadges: string[] = [];

  for (const badgeDefinition of BADGE_DEFINITIONS) {
    const hasEarned = await checkBadgeCriteria(userId, badgeDefinition);
    
    if (hasEarned) {
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badgeDefinition.id
          }
        }
      });

      if (!existingBadge) {
        await awardBadge(userId, badgeDefinition.id);
        newBadges.push(badgeDefinition.id);
      }
    }
  }

  return { newBadges, updatedBadges };
}

async function checkBadgeCriteria(userId: string, badge: BadgeDefinition): Promise<boolean> {
  const { criteria } = badge;

  switch (criteria.type) {
    case 'bench_count':
      return await checkBenchCount(userId, criteria.target);
    
    case 'unique_cities':
      return await checkUniqueCities(userId, criteria.target);
    
    case 'early_morning':
      return await checkEarlyMorning(userId, criteria.target);
    
    case 'late_night':
      return await checkLateNight(userId, criteria.target);
    
    case 'total_likes':
      return await checkTotalLikes(userId, criteria.target);
    
    case 'comment_count':
      return await checkCommentCount(userId, criteria.target);
    
    case 'daily_streak':
      return await checkDailyStreak(userId, criteria.target);
    
    case 'photo_count':
      return await checkPhotoCount(userId, criteria.target);
    
    case 'seasonal':
      return await checkSeasonal(userId, criteria.field!);
    
    case 'daily_count':
      return await checkDailyCount(userId, criteria.target);
    
    default:
      return false;
  }
}

async function checkBenchCount(userId: string, target: number): Promise<boolean> {
  const count = await prisma.bench.count({
    where: { userId }
  });
  return count >= target;
}

async function checkUniqueCities(userId: string, target: number): Promise<boolean> {
  const benches = await prisma.bench.findMany({
    where: { userId },
    select: { address: true }
  });
  
  const cities = new Set(
    benches
      .filter(bench => bench.address)
      .map(bench => bench.address!.split(',').pop()?.trim())
      .filter(city => city)
  );
  
  return cities.size >= target;
}

async function checkEarlyMorning(userId: string, target: number): Promise<boolean> {
  const benches = await prisma.bench.findMany({
    where: { userId },
    select: { createdAt: true }
  });
  
  return benches.some(bench => bench.createdAt.getHours() < target);
}

async function checkLateNight(userId: string, target: number): Promise<boolean> {
  const benches = await prisma.bench.findMany({
    where: { userId },
    select: { createdAt: true }
  });
  
  return benches.some(bench => bench.createdAt.getHours() >= target);
}

async function checkTotalLikes(userId: string, target: number): Promise<boolean> {
  const totalLikes = await prisma.like.count({
    where: {
      bench: {
        userId
      }
    }
  });
  
  return totalLikes >= target;
}

async function checkCommentCount(userId: string, target: number): Promise<boolean> {
  const count = await prisma.comment.count({
    where: { userId }
  });
  
  return count >= target;
}

async function checkDailyStreak(userId: string, target: number): Promise<boolean> {
  const benches = await prisma.bench.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
  
  if (benches.length === 0) return false;
  
  const dates = benches.map(bench => 
    new Date(bench.createdAt).toDateString()
  );
  
  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  
  let streak = 0;
  const today = new Date().toDateString();
  let currentDate = new Date();
  
  for (let i = 0; i < target; i++) {
    const dateStr = currentDate.toDateString();
    if (uniqueDates.includes(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak >= target;
}

async function checkPhotoCount(userId: string, target: number): Promise<boolean> {
  const count = await prisma.bench.count({
    where: { 
      userId,
      imageUrl: {
        not: null
      }
    }
  });
  
  return count >= target;
}

async function checkSeasonal(userId: string, season: string): Promise<boolean> {
  const benches = await prisma.bench.findMany({
    where: { userId },
    select: { createdAt: true }
  });
  
  return benches.some(bench => {
    const month = bench.createdAt.getMonth();
    switch (season) {
      case 'summer':
        return month >= 5 && month <= 7; // Juin, Juillet, Août
      case 'winter':
        return month === 11 || month === 0 || month === 1; // Décembre, Janvier, Février
      case 'spring':
        return month >= 2 && month <= 4; // Mars, Avril, Mai
      case 'autumn':
        return month >= 8 && month <= 10; // Septembre, Octobre, Novembre
      default:
        return false;
    }
  });
}

async function checkDailyCount(userId: string, target: number): Promise<boolean> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  const count = await prisma.bench.count({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  });
  
  return count >= target;
}

async function awardBadge(userId: string, badgeId: string): Promise<void> {
  let badge = await prisma.badge.findUnique({
    where: { name: badgeId }
  });

  if (!badge) {
    const badgeDefinition = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badgeDefinition) return;

    badge = await prisma.badge.create({
      data: {
        name: badgeDefinition.name,
        description: badgeDefinition.description,
        icon: badgeDefinition.icon,
        color: badgeDefinition.color,
        category: badgeDefinition.category,
        criteria: badgeDefinition.criteria,
        rarity: badgeDefinition.rarity
      }
    });
  }

  await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id
    }
  });
}

export async function getUserBadges(userId: string) {
  return await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: { unlockedAt: 'desc' }
  });
}