import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const purchaseSchema = z.object({
  shopItemId: z.string(),
})

// POST - купить товар
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const data = purchaseSchema.parse(body)

    // Получаем товар
    const shopItem = await prisma.shopItem.findUnique({
      where: { id: data.shopItemId },
    })

    if (!shopItem || !shopItem.isActive) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }

    // Получаем баланс EP пользователя
    const epHistory = await prisma.eventPoint.findMany({
      where: { userId: session.user.id },
    })
    const totalEP = epHistory.reduce((sum, ep) => sum + ep.amount, 0)

    // Проверяем, достаточно ли EP
    if (totalEP < shopItem.price) {
      return NextResponse.json(
        { error: 'Недостаточно EP', required: shopItem.price, current: totalEP },
        { status: 400 }
      )
    }

    // Вычисляем дату истечения
    let expiresAt: Date | null = null
    if (shopItem.duration > 0) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + shopItem.duration)
    }

    // Создаем покупку
    const purchase = await prisma.userPurchase.create({
      data: {
        userId: session.user.id,
        shopItemId: data.shopItemId,
        expiresAt,
      },
      include: {
        shopItem: true,
      },
    })

    // Списываем EP (создаем отрицательную запись)
    await prisma.eventPoint.create({
      data: {
        userId: session.user.id,
        amount: -shopItem.price,
        reason: `Покупка: ${shopItem.name}`,
      },
    })

    // Обновляем визуальные эффекты в зависимости от категории
    if (shopItem.category === 'NICKNAME_COLOR' || shopItem.category === 'AVATAR_BORDER' || shopItem.category === 'CUSTOM_TITLE') {
      const itemData = JSON.parse(shopItem.data || '{}')
      
      await prisma.userVisualEffects.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          nicknameColor: shopItem.category === 'NICKNAME_COLOR' ? shopItem.data : null,
          avatarBorder: shopItem.category === 'AVATAR_BORDER' ? shopItem.data : null,
          customTitle: shopItem.category === 'CUSTOM_TITLE' ? itemData.title || null : null,
        },
        update: {
          nicknameColor: shopItem.category === 'NICKNAME_COLOR' ? shopItem.data : undefined,
          avatarBorder: shopItem.category === 'AVATAR_BORDER' ? shopItem.data : undefined,
          customTitle: shopItem.category === 'CUSTOM_TITLE' ? itemData.title || null : undefined,
        },
      })
    }

    // Если это Spotlight, создаем запись
    if (shopItem.category === 'SPOTLIGHT') {
      const itemData = JSON.parse(shopItem.data || '{}')
      await prisma.spotlight.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          quote: itemData.quote || null,
          expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа по умолчанию
        },
        update: {
          quote: itemData.quote || null,
          expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
    }

    return NextResponse.json({
      success: true,
      purchase,
      newBalance: totalEP - shopItem.price,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при покупке:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

