import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Удаление всех пользователей...')

  // Удаляем все связанные данные в правильном порядке
  // (Prisma обработает каскадное удаление, но лучше быть явным)

  console.log('Удаление связанных данных...')
  
  // Удаляем все связанные записи
  await prisma.publicTaskInstance.deleteMany({})
  await prisma.registrationRequest.deleteMany({})
  await prisma.telegramNotification.deleteMany({})
  await prisma.questProgress.deleteMany({})
  await prisma.rating.deleteMany({})
  await prisma.mentor.deleteMany({})
  await prisma.achievement.deleteMany({})
  await prisma.eventPoint.deleteMany({})
  await prisma.userBadge.deleteMany({})
  await prisma.xPHistory.deleteMany({})
  await prisma.studentReport.deleteMany({})
  await prisma.taskReport.deleteMany({})
  await prisma.parliamentMember.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.userPurchase.deleteMany({})
  await prisma.userVisualEffects.deleteMany({})
  await prisma.loginStreak.deleteMany({})
  await prisma.duelParticipant.deleteMany({})
  await prisma.duel.deleteMany({})
  await prisma.challengeParticipant.deleteMany({})
  await prisma.challenge.deleteMany({})
  await prisma.guildMember.deleteMany({})
  await prisma.guild.deleteMany({})
  await prisma.seasonRating.deleteMany({})
  await prisma.recommendation.deleteMany({})
  await prisma.feedEvent.deleteMany({})
  await prisma.spotlight.deleteMany({})
  await prisma.passwordResetCode.deleteMany({})
  await prisma.telegramLinkCode.deleteMany({})
  await prisma.assignedQuest.deleteMany({})
  await prisma.compliment.deleteMany({})
  
  // Удаляем всех пользователей
  const deletedUsers = await prisma.user.deleteMany({})
  console.log(`✅ Удалено пользователей: ${deletedUsers.count}`)

  // Создаем нового администратора
  console.log('👤 Создание администратора...')
  
  const adminEmail = 'Krazher220@icloud.com'
  const adminPassword = 'AliSA04152010'
  const adminName = 'Krazher220'
  const adminClass = '9'
  const adminClassLetter = 'Д'
  const adminFullClass = '9Д'

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Создаем администратора
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'ADMIN',
      class: adminClass,
      classLetter: adminClassLetter,
      fullClass: adminFullClass,
    },
  })

  console.log('✅ Администратор создан:')
  console.log(`   Email: ${admin.email}`)
  console.log(`   Имя: ${admin.name}`)
  console.log(`   Роль: ${admin.role}`)
  console.log(`   Класс: ${admin.fullClass}`)
  console.log(`   ID: ${admin.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

