import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Удаление всех задач...')

  // Удаляем все связанные данные
  console.log('Удаление отчетов...')
  await prisma.taskReport.deleteMany({})
  
  console.log('Удаление отчетов учеников...')
  await prisma.studentReport.deleteMany({})
  
  console.log('Удаление инстансов общественных задач...')
  await prisma.publicTaskInstance.deleteMany({})
  
  // Удаляем все задачи
  console.log('Удаление задач...')
  const deleted = await prisma.task.deleteMany({})

  console.log(`✅ Удалено задач: ${deleted.count}`)
}

main()
  .catch((e) => {
    console.error('Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

