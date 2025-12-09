import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST - настроить webhook для Telegram бота
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ 
        error: 'TELEGRAM_BOT_TOKEN не установлен в переменных окружения' 
      }, { status: 500 })
    }

    if (!TELEGRAM_WEBHOOK_URL) {
      return NextResponse.json({ 
        error: 'TELEGRAM_WEBHOOK_URL не установлен в переменных окружения' 
      }, { status: 500 })
    }

    // Настраиваем webhook
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

    if (!data.ok) {
      return NextResponse.json({ 
        error: 'Ошибка настройки webhook',
        details: data.description 
      }, { status: 400 })
    }

    // Получаем информацию о webhook
    const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    const infoResponse = await fetch(infoUrl)
    const infoData = await infoResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Webhook успешно настроен',
      webhookInfo: infoData.ok ? infoData.result : null,
    })
  } catch (error) {
    console.error('Ошибка настройки webhook:', error)
    return NextResponse.json({ 
      error: 'Ошибка сервера',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  }
}

// GET - получить информацию о webhook
export async function GET() {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ 
        error: 'TELEGRAM_BOT_TOKEN не установлен' 
      }, { status: 500 })
    }

    const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    const infoResponse = await fetch(infoUrl)
    const infoData = await infoResponse.json()

    if (!infoData.ok) {
      return NextResponse.json({ 
        error: 'Ошибка получения информации о webhook',
        details: infoData.description 
      }, { status: 400 })
    }

    return NextResponse.json({
      webhookInfo: infoData.result,
      isActive: !!infoData.result.url,
    })
  } catch (error) {
    console.error('Ошибка получения информации о webhook:', error)
    return NextResponse.json({ 
      error: 'Ошибка сервера',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  }
}

