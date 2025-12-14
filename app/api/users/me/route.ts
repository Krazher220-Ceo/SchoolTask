import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить данные текущего пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        parliamentMember: true,
        loginStreak: true,
        visualEffects: true,
        achievements: {
          include: {
            achievement: true,
          },
          take: 10,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Получаем EP пользователя (сумма всех EventPoint)
    const epData = await prisma.eventPoint.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    })
    const ep = epData._sum.amount || 0

    // Определяем ранг на основе EP
    const ranks = [
      { name: 'Наблюдатель', threshold: 0, icon: '👤' },
      { name: 'Участник', threshold: 300, icon: '🌟' },
      { name: 'Энтузиаст', threshold: 800, icon: '⭐' },
      { name: 'Активист', threshold: 1500, icon: '💫' },
      { name: 'Лидер Мнений', threshold: 2500, icon: '🎯' },
      { name: 'Герой Школы', threshold: 4000, icon: '🏆' },
      { name: 'Легенда Школы', threshold: 6000, icon: '👑' },
    ]

    const currentRank = ranks.reverse().find(r => ep >= r.threshold) || ranks[0]
    const nextRank = ranks.find(r => r.threshold > ep) || ranks[ranks.length - 1]
    const epToNextRank = nextRank ? nextRank.threshold - ep : 0

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      class: user.class,
      classLetter: user.classLetter,
      fullClass: user.fullClass,
      role: user.role,
      avatar: user.avatar,
      ep,
      rank: currentRank.name,
      rankIcon: currentRank.icon,
      epToNextRank,
      xp: user.parliamentMember?.xp || 0,
      parliamentRank: user.parliamentMember?.rank || null,
      ministry: user.parliamentMember?.ministry || null,
      streak: user.loginStreak?.currentStreak || 0,
      achievements: user.achievements.length,
      visualEffects: user.visualEffects,
    })
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

