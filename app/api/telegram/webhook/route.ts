import { NextRequest, NextResponse } from 'next/server'
import { handleTelegramMessage } from '@/telegram/bot'

export const dynamic = 'force-dynamic'

// POST - webhook для Telegram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Telegram отправляет обновления в формате { update_id, message, ... }
    if (body.message || body.callback_query) {
      await handleTelegramMessage(body)
    }

    // Всегда возвращаем 200, чтобы Telegram не повторял запросы
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Ошибка обработки webhook Telegram:', error)
    return NextResponse.json({ ok: true }) // Все равно возвращаем 200
  }
}

// GET - для проверки webhook
export async function GET() {
  return NextResponse.json({ 
    message: 'Telegram webhook endpoint',
    status: 'active',
  })
}

