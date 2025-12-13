// Утилиты для автоматического создания событий в ленте

import { prisma } from './prisma'

interface CreateFeedEventParams {
  userId: string
  type: string
  title: string
  description: string
  data?: any
  category?: string
  highlight?: boolean
  pinned?: boolean
}

/**
 * Создает событие в ленте
 */
export async function createFeedEvent(params: CreateFeedEventParams) {
  try {
    return await prisma.feedEvent.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        description: params.description,
        data: params.data ? JSON.stringify(params.data) : null,
        category: params.category || null,
        highlight: params.highlight || false,
        pinned: params.pinned || false,
      },
    })
  } catch (error) {
    console.error('Ошибка создания события в ленте:', error)
    // Не прерываем выполнение, если не удалось создать событие
  }
}

/**
 * Создает событие о выполнении задачи
 */
export async function createTaskCompletedEvent(
  userId: string,
  taskTitle: string,
  reward: number,
  currency: 'XP' | 'EP'
) {
  return createFeedEvent({
    userId,
    type: 'task_completed',
    title: `Выполнена задача: ${taskTitle}`,
    description: `Получено ${reward} ${currency}`,
    data: { taskTitle, reward, currency },
    category: 'social',
  })
}

/**
 * Создает событие о разблокировке достижения
 */
export async function createAchievementEvent(
  userId: string,
  achievementName: string,
  achievementIcon: string
) {
  return createFeedEvent({
    userId,
    type: 'achievement_unlocked',
    title: `Достижение разблокировано: ${achievementName}`,
    description: `${achievementIcon} Новое достижение!`,
    data: { achievementName, achievementIcon },
    category: 'social',
    highlight: true,
  })
}

/**
 * Создает событие о повышении ранга
 */
export async function createRankUpEvent(
  userId: string,
  newRank: string,
  oldRank: string
) {
  return createFeedEvent({
    userId,
    type: 'rank_up',
    title: `Повышение ранга: ${newRank}`,
    description: `Поздравляем с повышением с "${oldRank}" до "${newRank}"!`,
    data: { newRank, oldRank },
    category: 'social',
    highlight: true,
  })
}

/**
 * Создает событие о стрике
 */
export async function createStreakEvent(userId: string, streakDays: number) {
  if (streakDays % 7 === 0 && streakDays > 0) {
    // Каждую неделю
    return createFeedEvent({
      userId,
      type: 'streak_milestone',
      title: `Стрик ${streakDays} дней!`,
      description: `🔥 Невероятная серия активности!`,
      data: { streakDays },
      category: 'social',
      highlight: streakDays >= 30,
    })
  }
}

/**
 * Создает событие о покупке в магазине
 */
export async function createShopPurchaseEvent(
  userId: string,
  itemName: string,
  price: number
) {
  return createFeedEvent({
    userId,
    type: 'shop_purchase',
    title: `Покупка: ${itemName}`,
    description: `Потрачено ${price} EP`,
    data: { itemName, price },
    category: 'economy',
  })
}

/**
 * Создает событие о рекорде
 */
export async function createRecordEvent(
  userId: string,
  recordType: string,
  value: number
) {
  return createFeedEvent({
    userId,
    type: 'record_broken',
    title: `🏆 РЕКОРД! ${recordType}`,
    description: `Новый рекорд: ${value}`,
    data: { recordType, value },
    category: 'competitive',
    highlight: true,
    pinned: true,
  })
}

