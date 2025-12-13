import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить статистику битвы министерств за сегодня
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Получаем сегодняшнюю дату (начало дня)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Получаем статистику за сегодня
    const todayStats = await prisma.ministryWar.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    // Если статистики нет, создаем нулевую для всех министерств
    const ministries = ['LAW_AND_ORDER', 'INFORMATION', 'SPORT', 'CARE']
    const statsMap: Record<string, number> = {}

    for (const ministry of ministries) {
      const stat = todayStats.find(s => s.ministry === ministry)
      statsMap[ministry] = stat?.epEarned || 0
    }

    // Вычисляем общее количество EP
    const totalEP = Object.values(statsMap).reduce((sum, ep) => sum + ep, 0)

    // Определяем победителя
    let winner: string | null = null
    let maxEP = 0
    for (const [ministry, ep] of Object.entries(statsMap)) {
      if (ep > maxEP) {
        maxEP = ep
        winner = ministry
      }
    }

    return NextResponse.json({
      stats: statsMap,
      totalEP,
      winner,
      date: today.toISOString(),
    })
  } catch (error) {
    console.error('Ошибка при получении статистики битвы:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST - обновить статистику (вызывается при начислении EP)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только админы и министры могут обновлять статистику
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MINISTER') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const { ministry, epAmount } = body

    if (!ministry || !epAmount || epAmount <= 0) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 })
    }

    // Получаем сегодняшнюю дату
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Обновляем или создаем запись
    await prisma.ministryWar.upsert({
      where: {
        date_ministry: {
          date: today,
          ministry,
        },
      },
      create: {
        date: today,
        ministry,
        epEarned: epAmount,
      },
      update: {
        epEarned: {
          increment: epAmount,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка при обновлении статистики битвы:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

