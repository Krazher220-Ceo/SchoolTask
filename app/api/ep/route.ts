import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const awardEPSchema = z.object({
  userId: z.string(),
  amount: z.number().int().min(1),
  reason: z.string().min(1),
  eventId: z.string().optional(),
})

// POST - начислить EP (Event Points) ученику
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN и MINISTER могут начислять EP
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MINISTER') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = awardEPSchema.parse(body)

    // Создаем запись о начислении EP
    await prisma.eventPoint.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        reason: data.reason,
        eventId: data.eventId,
      },
    })

    return NextResponse.json({
      message: 'EP начислены',
      amount: data.amount,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при начислении EP:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// GET - получить историю EP пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // Пользователь может видеть только свою историю, ADMIN - любую
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const history = await prisma.eventPoint.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // Подсчитываем общее количество EP
    const total = history.reduce((sum, item) => sum + item.amount, 0)

    return NextResponse.json({
      history,
      total,
    })
  } catch (error) {
    console.error('Ошибка при получении истории EP:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

