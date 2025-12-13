import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - использовать заморозку стрика
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Проверяем, есть ли активная покупка "Заморозка стрика"
    const freezePurchase = await prisma.userPurchase.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
        shopItem: {
          category: 'STREAK_FREEZE',
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        shopItem: true,
      },
    })

    if (!freezePurchase) {
      return NextResponse.json(
        { error: 'У вас нет активной заморозки стрика' },
        { status: 400 }
      )
    }

    // Получаем стрик
    let streak = await prisma.loginStreak.findUnique({
      where: { userId: session.user.id },
    })

    if (!streak) {
      return NextResponse.json({ error: 'Стрик не найден' }, { status: 404 })
    }

    // Проверяем, нужно ли использовать заморозку
    const now = new Date()
    const lastActivity = new Date(streak.lastActivityAt)
    const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLastActivity <= 24) {
      return NextResponse.json(
        { error: 'Заморозка не нужна, стрик еще активен' },
        { status: 400 }
      )
    }

    if (streak.freezeUsed) {
      return NextResponse.json(
        { error: 'Заморозка уже использована' },
        { status: 400 }
      )
    }

    // Используем заморозку
    streak = await prisma.loginStreak.update({
      where: { userId: session.user.id },
      data: {
        freezeUsed: true,
        lastActivityAt: now, // Обновляем время активности
      },
    })

    return NextResponse.json({
      success: true,
      streak,
      message: 'Заморозка стрика активирована',
    })
  } catch (error) {
    console.error('Ошибка при использовании заморозки:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

