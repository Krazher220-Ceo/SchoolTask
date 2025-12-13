import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить стрик пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    let streak = await prisma.loginStreak.findUnique({
      where: { userId: session.user.id },
    })

    // Если стрика нет, создаем
    if (!streak) {
      streak = await prisma.loginStreak.create({
        data: {
          userId: session.user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityAt: new Date(),
        },
      })
    }

    // Проверяем, не сломался ли стрик (прошло больше 24 часов)
    const now = new Date()
    const lastActivity = new Date(streak.lastActivityAt)
    const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLastActivity > 24 && !streak.freezeUsed) {
      // Стрик сломался
      await prisma.loginStreak.update({
        where: { userId: session.user.id },
        data: {
          currentStreak: 0,
          freezeUsed: false,
        },
      })
      streak.currentStreak = 0
    }

    return NextResponse.json(streak)
  } catch (error) {
    console.error('Ошибка при получении стрика:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST - обновить стрик (вызывается при любой активности)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    let streak = await prisma.loginStreak.findUnique({
      where: { userId: session.user.id },
    })

    const now = new Date()

    if (!streak) {
      // Создаем новый стрик
      streak = await prisma.loginStreak.create({
        data: {
          userId: session.user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityAt: now,
        },
      })
    } else {
      const lastActivity = new Date(streak.lastActivityAt)
      const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)

      let newStreak = streak.currentStreak
      let freezeUsed = streak.freezeUsed

      if (hoursSinceLastActivity > 24) {
        // Прошло больше 24 часов
        if (streak.freezeUsed) {
          // Заморозка использована, стрик сломался
          newStreak = 0
          freezeUsed = false
        } else {
          // Стрик сломался
          newStreak = 0
        }
      } else if (hoursSinceLastActivity < 24) {
        // В пределах 24 часов - увеличиваем стрик
        if (hoursSinceLastActivity >= 20) {
          // Близко к сбросу, но еще в пределах - увеличиваем
          newStreak = streak.currentStreak + 1
        } else {
          // Обычное обновление
          newStreak = streak.currentStreak + 1
        }
      }

      const longestStreak = Math.max(newStreak, streak.longestStreak)

      streak = await prisma.loginStreak.update({
        where: { userId: session.user.id },
        data: {
          currentStreak: newStreak,
          longestStreak,
          lastActivityAt: now,
          freezeUsed,
        },
      })
    }

    return NextResponse.json(streak)
  } catch (error) {
    console.error('Ошибка при обновлении стрика:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

