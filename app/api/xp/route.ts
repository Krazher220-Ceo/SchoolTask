import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLevelFromXP } from '@/lib/utils'
import { z } from 'zod'

const awardXPSchema = z.object({
  userId: z.string(),
  amount: z.number().int().min(1),
  reason: z.string().min(1),
  source: z.string().optional(),
  sourceId: z.string().optional(),
})

// POST - начислить XP пользователю
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN и MINISTER могут начислять XP
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MINISTER') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = awardXPSchema.parse(body)

    // Проверяем, что пользователь является членом парламента
    const member = await prisma.parliamentMember.findUnique({
      where: { userId: data.userId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Пользователь не является членом парламента' }, { status: 400 })
    }

    // Обновляем XP
    const updatedMember = await prisma.parliamentMember.update({
      where: { userId: data.userId },
      data: {
        xp: {
          increment: data.amount,
        },
      },
    })

    // Получаем новый уровень
    const { level, rank } = getLevelFromXP(updatedMember.xp)

    // Обновляем уровень и ранг
    await prisma.parliamentMember.update({
      where: { userId: data.userId },
      data: {
        level,
        rank,
      },
    })

    // Создаем запись в истории
    await prisma.xPHistory.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        reason: data.reason,
        source: data.source || 'manual',
        sourceId: data.sourceId,
      },
    })

    return NextResponse.json({
      message: 'XP начислены',
      xp: updatedMember.xp,
      level,
      rank,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при начислении XP:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// GET - получить историю XP пользователя
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

    const history = await prisma.xPHistory.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('Ошибка при получении истории XP:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

