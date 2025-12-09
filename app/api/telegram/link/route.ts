import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const linkSchema = z.object({
  telegramId: z.string().min(1),
  telegramUsername: z.string().optional().nullable(),
})

const generateCodeSchema = z.object({
  telegramId: z.string().min(1),
})

const verifyCodeSchema = z.object({
  code: z.string().length(6, 'Код должен состоять из 6 цифр'),
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

// PUT - сгенерировать код подтверждения для привязки по ID профиля
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const data = generateCodeSchema.parse(body)

    // Проверяем, не привязан ли уже этот Telegram ID к другому пользователю
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: data.telegramId },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({ 
        error: 'Этот Telegram аккаунт уже привязан к другому пользователю' 
      }, { status: 400 })
    }

    // Удаляем старые неиспользованные коды для этого пользователя
    await prisma.telegramLinkCode.deleteMany({
      where: {
        userId: session.user.id,
        used: false,
        expiresAt: { lt: new Date() },
      },
    })

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 минут

    // Создаем код подтверждения
    const linkCode = await prisma.telegramLinkCode.create({
      data: {
        userId: session.user.id,
        telegramId: data.telegramId,
        code,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      code,
      expiresAt: linkCode.expiresAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при генерации кода:', error)
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    return NextResponse.json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? { message: errorMessage, name: errorName } : undefined
    }, { status: 500 })
  }
}

// PATCH - подтвердить код и привязать аккаунт
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const data = verifyCodeSchema.parse(body)

    // Ищем код подтверждения
    const linkCode = await prisma.telegramLinkCode.findUnique({
      where: { code: data.code },
      include: { user: true },
    })

    if (!linkCode) {
      return NextResponse.json({ error: 'Неверный код подтверждения' }, { status: 400 })
    }

    if (linkCode.used) {
      return NextResponse.json({ error: 'Этот код уже использован' }, { status: 400 })
    }

    if (linkCode.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Код истек. Запросите новый код' }, { status: 400 })
    }

    if (linkCode.userId !== session.user.id) {
      return NextResponse.json({ error: 'Этот код не принадлежит вашему аккаунту' }, { status: 403 })
    }

    // Проверяем, не привязан ли уже этот Telegram ID к другому пользователю
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: linkCode.telegramId },
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
        telegramId: linkCode.telegramId,
      },
      select: {
        id: true,
        name: true,
        telegramId: true,
        telegramUsername: true,
      },
    })

    // Помечаем код как использованный
    await prisma.telegramLinkCode.update({
      where: { id: linkCode.id },
      data: { used: true },
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при подтверждении кода:', error)
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    return NextResponse.json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? { message: errorMessage, name: errorName } : undefined
    }, { status: 500 })
  }
}

