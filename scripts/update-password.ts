import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'alikhan@sch1.kz'
  const newPassword = 'AliSA04152010'

  console.log(`🔐 Обновление пароля для ${email}...`)

  // Находим пользователя
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.error(`❌ Пользователь с email ${email} не найден`)
    process.exit(1)
  }

  // Хешируем новый пароль
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // Обновляем пароль
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  })

  console.log(`✅ Пароль успешно обновлен для пользователя: ${user.name} (${email})`)
  console.log(`📝 Новый пароль: ${newPassword}`)
}

main()
  .catch((e) => {
    console.error('Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

