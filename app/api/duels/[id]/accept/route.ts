import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - принять дуэль
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const duel = await prisma.duel.findUnique({
      where: { id: params.id },
      include: {
        creator: true,
        opponent: true,
      },
    })

    if (!duel) {
      return NextResponse.json({ error: 'Дуэль не найдена' }, { status: 404 })
    }

    if (duel.opponentId !== session.user.id) {
      return NextResponse.json({ error: 'Ты не приглашен в эту дуэль' }, { status: 403 })
    }

    if (duel.status !== 'PENDING') {
      return NextResponse.json({ error: 'Дуэль уже начата или завершена' }, { status: 400 })
    }

    // Проверяем баланс оппонента
    const epHistory = await prisma.eventPoint.findMany({
      where: { userId: session.user.id },
    })
    const totalEP = epHistory.reduce((sum, ep) => sum + ep.amount, 0)

    if (totalEP < duel.stake) {
      return NextResponse.json(
        { error: 'Недостаточно EP', required: duel.stake, current: totalEP },
        { status: 400 }
      )
    }

    // Списываем EP у оппонента
    await prisma.eventPoint.create({
      data: {
        userId: session.user.id,
        amount: -duel.stake,
        reason: `Дуэль с ${duel.creator.name} (заморожено)`,
      },
    })

    // Активируем дуэль
    const updatedDuel = await prisma.duel.update({
      where: { id: params.id },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
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

    // Создаем участников
    await prisma.duelParticipant.createMany({
      data: [
        { duelId: params.id, userId: duel.creatorId },
        { duelId: params.id, userId: duel.opponentId },
      ],
    })

    return NextResponse.json(updatedDuel)
  } catch (error) {
    console.error('Ошибка принятия дуэли:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

