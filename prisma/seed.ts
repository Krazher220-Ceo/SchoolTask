import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Удаляем всех пользователей кроме админа
  const adminEmail = 'Krazher220@icloud.com'
  
  // Получаем ID админа, если он существует
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  })

  // Удаляем всех пользователей кроме админа
  // Сначала удаляем связанные записи для всех пользователей кроме админа
  if (existingAdmin) {
    // Получаем всех пользователей кроме админа
    const usersToDelete = await prisma.user.findMany({
      where: { id: { not: existingAdmin.id } },
      select: { id: true },
    })

    const userIdsToDelete = usersToDelete.map(u => u.id)

    // Удаляем связанные записи
    await prisma.publicTaskInstance.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.registrationRequest.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.telegramNotification.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.questProgress.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.rating.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.mentor.deleteMany({
      where: { OR: [
        { mentorId: { in: userIdsToDelete } },
        { menteeId: { in: userIdsToDelete } },
      ]},
    })
    // Compliment использует другие имена полей - проверяем схему
    // Пока пропускаем, если есть ошибка
    await prisma.achievement.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.eventPoint.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.userBadge.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.xPHistory.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.studentReport.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    await prisma.taskReport.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })
    
    // Удаляем задачи, созданные этими пользователями
    await prisma.task.deleteMany({
      where: { createdById: { in: userIdsToDelete } },
    })
    
    // Удаляем парламентских членов
    await prisma.parliamentMember.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    })

    // Теперь удаляем пользователей
    await prisma.user.deleteMany({
      where: { id: { in: userIdsToDelete } },
    })
  } else {
    // Если админа нет, удаляем все
    await prisma.user.deleteMany({})
  }
  console.log('✅ Удалены все пользователи кроме админа')

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Создаем или обновляем Алихана (Администратор)
  const alikhan = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: 'Кабдуалы Алихан Аязбекұлы',
      role: 'ADMIN',
      class: '9',
      classLetter: 'Д',
      fullClass: '9Д',
      telegramUsername: 'krazher220',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Кабдуалы Алихан Аязбекұлы',
      role: 'ADMIN',
      class: '9',
      classLetter: 'Д',
      fullClass: '9Д',
      telegramUsername: 'krazher220',
      parliamentMember: {
        create: {
          ministry: 'INFORMATION',
          position: 'Министр',
          xp: 0,
          level: 1,
          rank: 'Новичок',
        },
      },
    },
  })
  console.log('✅ Создан/обновлен Алихан (Администратор)')

  // Остальные пользователи не создаются - только админ
  console.log('✅ База данных очищена, оставлен только администратор')

  // Создаем базовые бейджи
  const badges = [
    { name: 'Первые шаги', description: 'Выполнил первую задачу', icon: '🎯', rarity: 'COMMON', category: 'tasks' },
    { name: 'Спринтер', description: 'Выполнил 5 задач досрочно', icon: '⚡', rarity: 'RARE', category: 'speed' },
    { name: 'Перфекционист', description: '10 отчетов приняты с первого раза', icon: '✨', rarity: 'EPIC', category: 'quality' },
    { name: 'Командный игрок', description: 'Помог 5 разным участникам', icon: '🤝', rarity: 'RARE', category: 'teamwork' },
    { name: 'Креативщик', description: 'Предложил 5 реализованных идей', icon: '💡', rarity: 'LEGENDARY', category: 'creativity' },
    { name: 'Фотограф', description: 'Загрузил 100 фото в отчеты', icon: '📷', rarity: 'RARE', category: 'media' },
    { name: 'Оператор', description: 'Загрузил 20 видео', icon: '🎥', rarity: 'EPIC', category: 'media' },
    { name: 'Неутомимый', description: 'Выполнил 50 задач', icon: '🔥', rarity: 'EPIC', category: 'tasks' },
    { name: 'Столп парламента', description: '1 год активного участия', icon: '🏛️', rarity: 'LEGENDARY', category: 'loyalty' },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    })
  }
  console.log(`✅ Создано ${badges.length} бейджей`)

  // Создаем базовые квесты
  const quests = [
    { name: 'Утренний старт', description: 'Проверить задачи до 9:00', type: 'DAILY', xpReward: 3, condition: '{}' },
    { name: 'Командир', description: 'Помочь 1 участнику', type: 'DAILY', xpReward: 5, condition: '{}' },
    { name: 'Продуктивный день', description: 'Выполнить 1 задачу', type: 'DAILY', xpReward: 10, condition: '{}' },
    { name: 'Продуктивная неделя', description: 'Выполнить 5 задач за неделю', type: 'WEEKLY', xpReward: 50, condition: '{}' },
    { name: 'Социальный', description: 'Взаимодействие с 3 министерствами', type: 'WEEKLY', xpReward: 25, condition: '{}' },
    { name: 'Креатор', description: 'Создать 3 поста/материала', type: 'WEEKLY', xpReward: 30, condition: '{}' },
  ]

  for (const quest of quests) {
    await prisma.quest.create({
      data: quest,
    }).catch(() => {
      // Игнорируем ошибки, если квест уже существует
    })
  }
  console.log(`✅ Создано ${quests.length} квестов`)

  console.log('🎉 База данных успешно заполнена!')
  console.log('\n📝 Данные для входа:')
  console.log('Email: Krazher220@icloud.com')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

