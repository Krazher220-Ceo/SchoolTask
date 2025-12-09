import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const linkSchema = z.object({
  telegramId: z.string().min(1),
  telegramUsername: z.string().optional().nullable(),
})

// POST - привязать Telegram аккаунт
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const data = linkSchema.parse(body)

    // Проверяем, не привязан ли уже этот Telegram ID к другому пользователю
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: data.telegramId },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({ 
        error: 'Этот Telegram аккаунт уже привязан к другому пользователю' 
      }, { status: 400 })
    }

    // Обновляем пользователя
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        telegramId: data.telegramId,
        telegramUsername: data.telegramUsername,
      },
      select: {
        id: true,
        name: true,
        telegramId: true,
        telegramUsername: true,
      },
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при привязке Telegram:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// GET - получить информацию о привязке Telegram
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        telegramId: true,
        telegramUsername: true,
      },
    })

    return NextResponse.json({
      isLinked: !!user?.telegramId,
      telegramId: user?.telegramId,
      telegramUsername: user?.telegramUsername,
    })
  } catch (error) {
    console.error('Ошибка при получении информации о Telegram:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

