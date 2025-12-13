import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ACHIEVEMENTS } from '@/lib/achievements'

export const dynamic = 'force-dynamic'

// GET - получить достижения пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // Получаем полученные достижения
    const earnedAchievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    })

    // Получаем все определения достижений
    const allAchievements = ACHIEVEMENTS.map(ach => {
      const earned = earnedAchievements.find(e => e.title === ach.name)
      return {
        ...ach,
        earned: !!earned,
        earnedAt: earned?.earnedAt || null,
      }
    })

    // Группируем по категориям
    const byCategory = allAchievements.reduce((acc, ach) => {
      if (!acc[ach.category]) {
        acc[ach.category] = []
      }
      acc[ach.category].push(ach)
      return acc
    }, {} as Record<string, typeof allAchievements>)

    return NextResponse.json({
      achievements: allAchievements,
      byCategory,
      stats: {
        total: allAchievements.length,
        earned: earnedAchievements.length,
        progress: Math.round((earnedAchievements.length / allAchievements.length) * 100),
      },
    })
  } catch (error) {
    console.error('Ошибка получения достижений:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

