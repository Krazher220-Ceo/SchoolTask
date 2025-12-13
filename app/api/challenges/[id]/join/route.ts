import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - присоединиться к челленджу
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Челлендж не найден' }, { status: 404 })
    }

    if (challenge.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Челлендж не активен' }, { status: 400 })
    }

    if (new Date(challenge.endsAt) < new Date()) {
      return NextResponse.json({ error: 'Челлендж уже завершен' }, { status: 400 })
    }

    // Проверяем, не участвует ли уже
    const existing = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Ты уже участвуешь в этом челлендже' }, { status: 400 })
    }

    // Добавляем участника
    await prisma.challengeParticipant.create({
      data: {
        challengeId: params.id,
        userId: session.user.id,
        epContributed: 0,
      },
    })

    return NextResponse.json({ success: true, message: 'Ты присоединился к челленджу!' })
  } catch (error) {
    console.error('Ошибка присоединения к челленджу:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

