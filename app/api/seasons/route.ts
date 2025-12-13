import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить текущий сезон и рейтинги
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Получаем активный сезон
    const activeSeason = await prisma.season.findFirst({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    })

    if (!activeSeason) {
      return NextResponse.json({
        season: null,
        message: 'Нет активного сезона',
      })
    }

    // Получаем рейтинг сезона
    const seasonRatings = await prisma.seasonRating.findMany({
      where: { seasonId: activeSeason.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            visualEffects: true,
          },
        },
      },
      orderBy: { ep: 'desc' },
      take: 100,
    })

    // Получаем позицию пользователя
    const userRating = await prisma.seasonRating.findUnique({
      where: {
        seasonId_userId: {
          seasonId: activeSeason.id,
          userId: session.user.id,
        },
      },
    })

    // Получаем глобальный рейтинг (все время)
    const allUsers = await prisma.user.findMany({
      include: {
        eventPoints: true,
        visualEffects: true,
      },
    })

    const globalRatings = allUsers
      .map(user => {
        const totalEP = user.eventPoints.reduce((sum, ep) => sum + ep.amount, 0)
        return {
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          visualEffects: user.visualEffects,
          ep: totalEP,
        }
      })
      .filter(u => u.ep > 0)
      .sort((a, b) => b.ep - a.ep)
      .slice(0, 100)
      .map((u, index) => ({
        ...u,
        position: index + 1,
      }))

    return NextResponse.json({
      season: activeSeason,
      seasonRatings: seasonRatings.map((r, index) => ({
        ...r,
        position: index + 1,
      })),
      userSeasonRating: userRating
        ? {
            ...userRating,
            position: seasonRatings.findIndex(r => r.userId === session.user.id) + 1,
          }
        : null,
      globalRatings,
      userGlobalPosition: globalRatings.findIndex(r => r.userId === session.user.id) + 1,
    })
  } catch (error) {
    console.error('Ошибка получения сезонов:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

