import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить список товаров в магазине
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const items = await prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    })

    // Получаем активные покупки пользователя
    const userPurchases = await prisma.userPurchase.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        shopItem: true,
      },
    })

    // Получаем баланс EP пользователя
    const epHistory = await prisma.eventPoint.findMany({
      where: { userId: session.user.id },
    })
    const totalEP = epHistory.reduce((sum, ep) => sum + ep.amount, 0)

    // Получаем активные визуальные эффекты
    const visualEffects = await prisma.userVisualEffects.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      items,
      userPurchases: userPurchases.map(p => ({
        id: p.id,
        shopItemId: p.shopItemId,
        category: p.shopItem.category,
        expiresAt: p.expiresAt,
      })),
      userBalance: totalEP,
      visualEffects,
    })
  } catch (error) {
    console.error('Ошибка при получении товаров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

