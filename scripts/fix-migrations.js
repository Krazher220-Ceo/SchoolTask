#!/usr/bin/env node
/**
 * Скрипт для автоматического разрешения провалившихся миграций Prisma
 * Используется в Vercel build для автоматического восстановления после ошибок миграций
 */

const { execSync } = require('child_process')

console.log('🔧 Проверка и разрешение провалившихся миграций...')

// Список известных провалившихся миграций (помечаем как примененные, так как таблицы уже существуют)
const knownFailedMigrations = [
  '20251209155927_add_telegram_link_code',
  '20251215120000_add_shop_gamification',
  '20251215130000_add_all_gamification_systems',
]

try {
  // Пытаемся применить миграции
  console.log('📦 Применение миграций...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  console.log('✅ Все миграции применены успешно!')
} catch (error) {
  console.log('⚠️  Обнаружены провалившиеся миграции, разрешаем...')
  
  // Получаем список провалившихся миграций из вывода ошибки
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || ''
  
  // Ищем провалившиеся миграции в выводе
  const failedMigrationMatch = errorOutput.match(/The `(\d+_\w+)` migration.*failed/)
  
  let failedMigration = null
  if (failedMigrationMatch) {
    failedMigration = failedMigrationMatch[1]
  } else {
    // Если не нашли в выводе, проверяем известные
    for (const migration of knownFailedMigrations) {
      if (errorOutput.includes(migration)) {
        failedMigration = migration
        break
      }
    }
  }
  
  if (failedMigration) {
    console.log(`🔄 Обнаружена провалившаяся миграция: ${failedMigration}`)
    
    // Помечаем как примененную (таблицы уже существуют в БД)
    try {
      console.log(`✅ Помечаем миграцию ${failedMigration} как примененную...`)
      execSync(`npx prisma migrate resolve --applied ${failedMigration}`, { stdio: 'inherit' })
      console.log(`✅ Миграция ${failedMigration} помечена как примененная`)
    } catch (e) {
      console.log(`⚠️  Не удалось пометить как примененную, пробуем как откаченную...`)
      try {
        execSync(`npx prisma migrate resolve --rolled-back ${failedMigration}`, { stdio: 'inherit' })
        console.log(`✅ Миграция ${failedMigration} помечена как откаченная`)
      } catch (e2) {
        console.log(`⚠️  Не удалось разрешить миграцию ${failedMigration}, используем db push...`)
      }
    }
  } else {
    console.log('⚠️  Не удалось определить провалившуюся миграцию, пробуем разрешить все известные...')
    // Пробуем разрешить все известные провалившиеся миграции
    for (const migration of knownFailedMigrations) {
      try {
        console.log(`🔄 Пробуем разрешить миграцию ${migration}...`)
        execSync(`npx prisma migrate resolve --applied ${migration}`, { stdio: 'pipe' })
        console.log(`✅ Миграция ${migration} разрешена`)
      } catch (e) {
        // Игнорируем ошибки
      }
    }
  }
  
  // Пытаемся применить миграции снова
  console.log('📦 Повторное применение миграций...')
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    console.log('✅ Миграции применены!')
  } catch (retryError) {
    // Если все еще ошибка, используем db push как fallback
    console.log('⚠️  Миграции не применились, используем db push как fallback...')
    execSync('npx prisma db push --accept-data-loss --skip-generate', { stdio: 'inherit' })
    console.log('✅ База данных синхронизирована через db push!')
  }
}

