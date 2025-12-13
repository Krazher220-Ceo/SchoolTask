import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createChallengeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['CLASS', 'SCHOOL', 'INTER_CLASS']),
  targetEP: z.number().int().min(100),
  reward: z.string(),
  endsAt: z.string().transform(str => new Date(str)),
})

// POST - создать челлендж
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только админы и министры могут создавать челленджи
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MINISTER') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = createChallengeSchema.parse(body)

    const challenge = await prisma.challenge.create({
      data: {
        creatorId: session.user.id,
        title: data.title,
        description: data.description,
        type: data.type,
        targetEP: data.targetEP,
        reward: data.reward,
        endsAt: data.endsAt,
        status: 'ACTIVE',
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка создания челленджа:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// GET - получить активные челленджи
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const challenges = await prisma.challenge.findMany({
      where: {
        status: 'ACTIVE',
        endsAt: { gt: new Date() },
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { epContributed: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Вычисляем прогресс для каждого челленджа
    const challengesWithProgress = challenges.map(challenge => {
      const totalEP = challenge.participants.reduce((sum, p) => sum + p.epContributed, 0)
      const progress = Math.min(100, (totalEP / challenge.targetEP) * 100)
      const participantCount = challenge.participants.length

      return {
        ...challenge,
        currentEP: totalEP,
        progress,
        participantCount,
      }
    })

    return NextResponse.json(challengesWithProgress)
  } catch (error) {
    console.error('Ошибка получения челленджей:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

