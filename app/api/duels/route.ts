import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createFeedEvent } from '@/lib/feed-events'

export const dynamic = 'force-dynamic'

const createDuelSchema = z.object({
  opponentId: z.string(),
  stake: z.number().int().min(50).max(500),
  duration: z.number().int().min(1).max(7), // дни
  category: z.string().optional(),
})

// POST - создать дуэль
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const data = createDuelSchema.parse(body)

    // Проверяем баланс EP
    const epHistory = await prisma.eventPoint.findMany({
      where: { userId: session.user.id },
    })
    const totalEP = epHistory.reduce((sum, ep) => sum + ep.amount, 0)

    if (totalEP < data.stake) {
      return NextResponse.json(
        { error: 'Недостаточно EP', required: data.stake, current: totalEP },
        { status: 400 }
      )
    }

    // Проверяем, что оппонент существует
    const opponent = await prisma.user.findUnique({
      where: { id: data.opponentId },
    })

    if (!opponent) {
      return NextResponse.json({ error: 'Оппонент не найден' }, { status: 404 })
    }

    if (opponent.id === session.user.id) {
      return NextResponse.json({ error: 'Нельзя вызвать себя на дуэль' }, { status: 400 })
    }

    // Создаем дуэль
    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + data.duration)

    const duel = await prisma.duel.create({
      data: {
        creatorId: session.user.id,
        opponentId: data.opponentId,
        stake: data.stake,
        duration: data.duration,
        category: data.category || null,
        status: 'PENDING',
        endsAt,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        opponent: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    // Списываем EP у создателя (замораживаем)
    await prisma.eventPoint.create({
      data: {
        userId: session.user.id,
        amount: -data.stake,
        reason: `Дуэль с ${opponent.name} (заморожено)`,
      },
    })

    // Создаем событие в ленте
    await createFeedEvent({
      userId: session.user.id,
      type: 'duel_created',
      title: `Дуэль: ${session.user.name} vs ${opponent.name}`,
      description: `Ставка: ${data.stake} EP каждый, срок: ${data.duration} дней`,
      category: 'competitive',
      highlight: true,
    })

    return NextResponse.json(duel, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка создания дуэли:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// GET - получить дуэли пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'ACTIVE'

    const duels = await prisma.duel.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          { opponentId: session.user.id },
        ],
        status: status as any,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, visualEffects: true },
        },
        opponent: {
          select: { id: true, name: true, avatar: true, visualEffects: true },
        },
        winner: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(duels)
  } catch (error) {
    console.error('Ошибка получения дуэлей:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

