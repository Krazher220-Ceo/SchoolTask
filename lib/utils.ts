import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Функции для работы с уровнями и рангами
export function getLevelFromXP(xp: number): { level: number; rank: string; nextLevelXP: number } {
  if (xp < 100) return { level: 1, rank: 'Новичок', nextLevelXP: 100 }
  if (xp < 300) return { level: 2, rank: 'Активист', nextLevelXP: 300 }
  if (xp < 600) return { level: 3, rank: 'Энтузиаст', nextLevelXP: 600 }
  if (xp < 1000) return { level: 4, rank: 'Организатор', nextLevelXP: 1000 }
  if (xp < 1500) return { level: 5, rank: 'Эксперт', nextLevelXP: 1500 }
  if (xp < 2500) return { level: 6, rank: 'Мастер', nextLevelXP: 2500 }
  return { level: 7, rank: 'Легенда', nextLevelXP: Infinity }
}

export function getRankFromEP(ep: number): string {
  if (ep < 50) return 'Наблюдатель'
  if (ep < 150) return 'Участник'
  if (ep < 300) return 'Активный участник'
  if (ep < 500) return 'Энергайзер'
  if (ep < 800) return 'Звезда школы'
  return 'Легенда школы'
}

export function calculateLevelFromEP(ep: number): { level: number; rank: string; nextLevelEP: number } {
  if (ep < 50) return { level: 1, rank: 'Наблюдатель', nextLevelEP: 50 }
  if (ep < 150) return { level: 2, rank: 'Участник', nextLevelEP: 150 }
  if (ep < 300) return { level: 3, rank: 'Активный участник', nextLevelEP: 300 }
  if (ep < 500) return { level: 4, rank: 'Энергайзер', nextLevelEP: 500 }
  if (ep < 800) return { level: 5, rank: 'Звезда школы', nextLevelEP: 800 }
  return { level: 6, rank: 'Легенда школы', nextLevelEP: Infinity }
}

// Названия министерств
export const ministryNames: Record<string, string> = {
  LAW_AND_ORDER: 'Права и порядка',
  INFORMATION: 'Информации',
  SPORT: 'Спорта',
  CARE: 'Заботы',
}

// Слаг министерств
export const ministrySlugs: Record<string, string> = {
  LAW_AND_ORDER: 'law-and-order',
  INFORMATION: 'information',
  SPORT: 'sport',
  CARE: 'care',
}

export const ministrySlugToEnum: Record<string, string> = {
  'law-and-order': 'LAW_AND_ORDER',
  'information': 'INFORMATION',
  'sport': 'SPORT',
  'care': 'CARE',
}

