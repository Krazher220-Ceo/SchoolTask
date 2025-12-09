import { prisma } from './prisma'

/**
 * Получить случайные ежедневные задания для ученика (3 из 100)
 */
export async function getDailyQuestsForUser(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Проверяем, есть ли уже назначенные задания на сегодня
  const existingAssignments = await prisma.assignedQuest.findMany({
    where: {
      userId,
      period: 'daily',
      periodDate: today,
    },
    include: {
      quest: true,
    },
  })

  // Если уже есть 3 задания на сегодня, возвращаем их
  if (existingAssignments.length >= 3) {
    return existingAssignments.map(a => a.quest)
  }

  // Получаем все активные ежедневные задания
  const allDailyQuests = await prisma.quest.findMany({
    where: {
      type: 'DAILY',
      isActive: true,
    },
  })

  if (allDailyQuests.length === 0) {
    // Если нет квестов, возвращаем пустой массив (не ошибка)
    return []
  }

  // Получаем ID уже назначенных заданий на сегодня
  const assignedIds = existingAssignments.map(a => a.questId)

  // Фильтруем доступные задания (исключаем уже назначенные)
  const availableQuests = allDailyQuests.filter(q => !assignedIds.includes(q.id))

  // Нужно назначить еще заданий
  const neededCount = 3 - existingAssignments.length
  const toAssign = neededCount > 0 ? neededCount : 0

  // Случайно выбираем задания
  const selectedQuests = shuffleArray([...availableQuests]).slice(0, toAssign)

  // Назначаем выбранные задания
  if (selectedQuests.length > 0) {
    await prisma.assignedQuest.createMany({
      data: selectedQuests.map(quest => ({
        questId: quest.id,
        userId,
        period: 'daily',
        periodDate: today,
      })),
    })
  }

  // Возвращаем все назначенные задания (старые + новые)
  const allAssigned = await prisma.assignedQuest.findMany({
    where: {
      userId,
      period: 'daily',
      periodDate: today,
    },
    include: {
      quest: true,
    },
  })

  return allAssigned.map(a => a.quest)
}

/**
 * Получить случайные недельные задания для ученика (2 из 50)
 */
export async function getWeeklyQuestsForUser(userId: string) {
  // Находим начало текущей недели (понедельник)
  const now = new Date()
  const weekStart = new Date(now)
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Понедельник
  weekStart.setDate(diff)
  weekStart.setHours(0, 0, 0, 0)

  // Проверяем, есть ли уже назначенные задания на эту неделю
  const existingAssignments = await prisma.assignedQuest.findMany({
    where: {
      userId,
      period: 'weekly',
      periodDate: weekStart,
    },
    include: {
      quest: true,
    },
  })

  // Если уже есть 2 задания на эту неделю, возвращаем их
  if (existingAssignments.length >= 2) {
    return existingAssignments.map(a => a.quest)
  }

  // Получаем все активные недельные задания
  const allWeeklyQuests = await prisma.quest.findMany({
    where: {
      type: 'WEEKLY',
      isActive: true,
    },
  })

  if (allWeeklyQuests.length === 0) {
    return []
  }

  // Получаем ID уже назначенных заданий на эту неделю
  const assignedIds = existingAssignments.map(a => a.questId)

  // Фильтруем доступные задания
  const availableQuests = allWeeklyQuests.filter(q => !assignedIds.includes(q.id))

  // Нужно назначить еще заданий
  const neededCount = 2 - existingAssignments.length
  const toAssign = neededCount > 0 ? neededCount : 0

  // Случайно выбираем задания
  const selectedQuests = shuffleArray([...availableQuests]).slice(0, toAssign)

  // Назначаем выбранные задания
  if (selectedQuests.length > 0) {
    await prisma.assignedQuest.createMany({
      data: selectedQuests.map(quest => ({
        questId: quest.id,
        userId,
        period: 'weekly',
        periodDate: weekStart,
      })),
    })
  }

  // Возвращаем все назначенные задания
  const allAssigned = await prisma.assignedQuest.findMany({
    where: {
      userId,
      period: 'weekly',
      periodDate: weekStart,
    },
    include: {
      quest: true,
    },
  })

  return allAssigned.map(a => a.quest)
}

/**
 * Получить случайное месячное задание для ученика (1 из 25)
 */
export async function getMonthlyQuestsForUser(userId: string) {
  // Находим начало текущего месяца
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  monthStart.setHours(0, 0, 0, 0)

  // Проверяем, есть ли уже назначенное задание на этот месяц
  const existingAssignment = await prisma.assignedQuest.findFirst({
    where: {
      userId,
      period: 'monthly',
      periodDate: monthStart,
    },
    include: {
      quest: true,
    },
  })

  // Если уже есть задание на этот месяц, возвращаем его
  if (existingAssignment) {
    return [existingAssignment.quest]
  }

  // Получаем все активные месячные задания
  const allMonthlyQuests = await prisma.quest.findMany({
    where: {
      type: 'MONTHLY',
      isActive: true,
    },
  })

  if (allMonthlyQuests.length === 0) {
    return []
  }

  // Случайно выбираем одно задание
  const selectedQuest = shuffleArray([...allMonthlyQuests])[0]

  // Назначаем выбранное задание
  await prisma.assignedQuest.create({
    data: {
      questId: selectedQuest.id,
      userId,
      period: 'monthly',
      periodDate: monthStart,
    },
  })

  return [selectedQuest]
}

/**
 * Перемешать массив (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Получить все задания для ученика (ежедневные, недельные, месячные)
 */
export async function getAllQuestsForUser(userId: string) {
  const [daily, weekly, monthly] = await Promise.all([
    getDailyQuestsForUser(userId),
    getWeeklyQuestsForUser(userId),
    getMonthlyQuestsForUser(userId),
  ])

  return {
    daily,
    weekly,
    monthly,
  }
}

/**
 * Убедиться, что все квесты назначены пользователю
 */
export async function ensureQuestsAssigned(userId: string) {
  await Promise.all([
    getDailyQuestsForUser(userId),
    getWeeklyQuestsForUser(userId),
    getMonthlyQuestsForUser(userId),
  ])
}

