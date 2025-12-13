// Система достижений с автоматической проверкой условий

import { prisma } from './prisma'
import { createAchievementEvent } from './feed-events'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: string
  condition: {
    type: string
    value: number
    [key: string]: any
  }
  reward: {
    ep?: number
    xp?: number
  }
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  hidden?: boolean
}

// Определения достижений
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Первопроходец
  {
    id: 'first_task',
    name: 'Первый шаг',
    description: 'Выполни свою первую задачу',
    icon: '🎯',
    category: 'Первопроходец',
    condition: { type: 'tasks_completed', value: 1 },
    reward: { ep: 50 },
    rarity: 'COMMON',
  },
  {
    id: 'first_week',
    name: 'Недельный Марафон',
    description: '7 дней активности подряд',
    icon: '📅',
    category: 'Первопроходец',
    condition: { type: 'streak_days', value: 7 },
    reward: { ep: 100 },
    rarity: 'COMMON',
  },
  {
    id: 'first_rank_up',
    name: 'Рост начинается',
    description: 'Достигни ранга "Участник"',
    icon: '⭐',
    category: 'Первопроходец',
    condition: { type: 'rank', value: 2 }, // Ранг 2 = Участник
    reward: { ep: 200 },
    rarity: 'COMMON',
  },
  // Социальные
  {
    id: 'team_player',
    name: 'Командный игрок',
    description: 'Выполни 10 групповых задач',
    icon: '🤝',
    category: 'Социальный',
    condition: { type: 'group_tasks_completed', value: 10 },
    reward: { ep: 150 },
    rarity: 'RARE',
  },
  {
    id: 'organizer',
    name: 'Организатор',
    description: 'Создай 5 своих мероприятий',
    icon: '🎪',
    category: 'Социальный',
    condition: { type: 'events_created', value: 5 },
    reward: { ep: 300 },
    rarity: 'RARE',
  },
  {
    id: 'mentor',
    name: 'Наставник',
    description: 'Помоги 10 новичкам адаптироваться',
    icon: '🎓',
    category: 'Социальный',
    condition: { type: 'mentees_helped', value: 10 },
    reward: { ep: 250 },
    rarity: 'EPIC',
  },
  // Рекорды
  {
    id: 'top_monthly',
    name: 'Месяц Лидера',
    description: 'Займи 1-е место в месячном рейтинге',
    icon: '👑',
    category: 'Рекорды',
    condition: { type: 'monthly_rank', value: 1 },
    reward: { ep: 1000 },
    rarity: 'LEGENDARY',
  },
  {
    id: 'thousand_tasks',
    name: 'Тысячник',
    description: 'Выполни 1000 задач',
    icon: '🎖️',
    category: 'Рекорды',
    condition: { type: 'tasks_completed', value: 1000 },
    reward: { ep: 5000 },
    rarity: 'LEGENDARY',
  },
  {
    id: 'legendary_streak',
    name: 'Легендарный Стрик',
    description: '100 дней активности подряд',
    icon: '🔥',
    category: 'Рекорды',
    condition: { type: 'streak_days', value: 100 },
    reward: { ep: 3000 },
    rarity: 'LEGENDARY',
  },
  // Секретные
  {
    id: 'midnight_warrior',
    name: 'Полуночный Воин',
    description: 'Выполни задачу в 00:00-01:00',
    icon: '🌙',
    category: 'Легендарные',
    condition: { type: 'task_at_hour', value: 0, hourRange: [0, 1] },
    reward: { ep: 500 },
    rarity: 'RARE',
    hidden: true,
  },
]

/**
 * Проверяет все достижения для пользователя
 */
export async function checkAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      eventPoints: true,
      taskReports: {
        where: { status: 'APPROVED' },
      },
      loginStreak: true,
      achievements: true,
    },
  })

  if (!user) return []

  const unlockedAchievements: string[] = []

  for (const achievement of ACHIEVEMENTS) {
    // Проверяем, не получено ли уже достижение
    const alreadyEarned = user.achievements.some(a => a.title === achievement.name)
    if (alreadyEarned) continue

    // Проверяем условие
    const conditionMet = await checkCondition(user, achievement.condition)
    
    if (conditionMet) {
      // Начисляем награду
      if (achievement.reward.ep) {
        await prisma.eventPoint.create({
          data: {
            userId,
            amount: achievement.reward.ep,
            reason: `Достижение: ${achievement.name}`,
          },
        })
      }

      // Создаем запись о достижении
      await prisma.achievement.create({
        data: {
          userId,
          title: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
        },
      })

      // Создаем событие в ленте
      await createAchievementEvent(userId, achievement.name, achievement.icon)

      unlockedAchievements.push(achievement.id)
    }
  }

  return unlockedAchievements
}

/**
 * Проверяет условие достижения
 */
async function checkCondition(user: any, condition: any): Promise<boolean> {
  switch (condition.type) {
    case 'tasks_completed':
      return user.taskReports.length >= condition.value

    case 'streak_days':
      return (user.loginStreak?.currentStreak || 0) >= condition.value

    case 'rank':
      // Нужно вычислить ранг на основе EP
      const totalEP = user.eventPoints.reduce((sum: number, ep: any) => sum + ep.amount, 0)
      const rank = getRankFromEP(totalEP)
      return rank >= condition.value

    case 'group_tasks_completed':
      // Задачи с несколькими участниками
      const groupTasks = await prisma.task.findMany({
        where: {
          OR: [
            { assignedToId: user.id },
            { createdById: user.id },
          ],
          taskType: 'PUBLIC',
        },
        include: {
          publicTaskInstances: true,
        },
      })
      return groupTasks.filter(t => (t.publicTaskInstances?.length || 0) > 1).length >= condition.value

    case 'events_created':
      const eventsCount = await prisma.event.count({
        where: { createdById: user.id },
      })
      return eventsCount >= condition.value

    case 'mentees_helped':
      const menteesCount = await prisma.mentor.count({
        where: { mentorId: user.id, isActive: true },
      })
      return menteesCount >= condition.value

    case 'monthly_rank':
      // Проверка месячного рейтинга (требует дополнительной логики)
      return false // TODO: Реализовать проверку месячного рейтинга

    case 'task_at_hour':
      // Проверка времени выполнения задачи
      const recentTasks = await prisma.taskReport.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // За последние 24 часа
          },
        },
      })
      return recentTasks.some(task => {
        const hour = new Date(task.createdAt).getHours()
        return hour >= condition.hourRange[0] && hour < condition.hourRange[1]
      })

    default:
      return false
  }
}

function getRankFromEP(ep: number): number {
  if (ep < 50) return 1
  if (ep < 150) return 2
  if (ep < 300) return 3
  if (ep < 500) return 4
  if (ep < 800) return 5
  if (ep < 1200) return 6
  return 7
}

