/**
 * Скрипт для настройки Telegram Webhook
 * 
 * Использование:
 * 1. Убедитесь, что TELEGRAM_BOT_TOKEN и TELEGRAM_WEBHOOK_URL установлены в .env.local
 * 2. Запустите: node scripts/setup-telegram-webhook.js
 * 
 * Или для Vercel:
 * После деплоя выполните команду с вашим доменом Vercel
 */

require('dotenv').config({ path: '.env.local' })

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || process.env.NEXTAUTH_URL + '/api/telegram/webhook'

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен в .env.local')
  process.exit(1)
}

if (!TELEGRAM_WEBHOOK_URL) {
  console.error('❌ TELEGRAM_WEBHOOK_URL не установлен в .env.local')
  process.exit(1)
}

async function setupWebhook() {
  try {
    console.log('🔧 Настройка Telegram Webhook...')
    console.log(`📡 URL: ${TELEGRAM_WEBHOOK_URL}`)
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: TELEGRAM_WEBHOOK_URL,
      }),
    })

    const data = await response.json()

    if (data.ok) {
      console.log('✅ Webhook успешно настроен!')
      console.log(`📋 Информация: ${JSON.stringify(data.result, null, 2)}`)
      
      // Проверяем информацию о webhook
      const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
      const infoResponse = await fetch(infoUrl)
      const infoData = await infoResponse.json()
      
      if (infoData.ok) {
        console.log('\n📊 Информация о webhook:')
        console.log(JSON.stringify(infoData.result, null, 2))
      }
    } else {
      console.error('❌ Ошибка настройки webhook:', data.description)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
    process.exit(1)
  }
}

setupWebhook()


