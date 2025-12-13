import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createGuildSchema = z.object({
  name: z.string().min(3).max(30),
  description: z.string().min(10).max(200),
  icon: z.string().optional(),
  color: z.string().optional(),
})

// POST - создать гильдию
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const data = createGuildSchema.parse(body)

    // Проверяем, не состоит ли уже в гильдии
    const existingMember = await prisma.guildMember.findFirst({
      where: { userId: session.user.id },
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Ты уже состоишь в гильдии' }, { status: 400 })
    }

    // Создаем гильдию
    const guild = await prisma.guild.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon || '👥',
        color: data.color || '#6366f1',
        creatorId: session.user.id,
      },
    })

    // Добавляем создателя как лидера
    await prisma.guildMember.create({
      data: {
        guildId: guild.id,
        userId: session.user.id,
        role: 'LEADER',
      },
    })

    return NextResponse.json(guild, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка создания гильдии:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// GET - получить гильдии
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const top = searchParams.get('top') === 'true'

    if (top) {
      // Топ гильдий по EP
      const guilds = await prisma.guild.findMany({
        where: { isActive: true },
        include: {
          members: {
            include: {
              user: {
                include: {
                  eventPoints: true,
                },
              },
            },
          },
        },
        orderBy: { totalEP: 'desc' },
        take: 10,
      })

      // Вычисляем реальный EP для каждой гильдии
      const guildsWithEP = guilds.map(guild => {
        const totalEP = guild.members.reduce((sum, member) => {
          const userEP = member.user.eventPoints.reduce((s, ep) => s + ep.amount, 0)
          return sum + userEP
        }, 0)

        return {
          ...guild,
          calculatedEP: totalEP,
          memberCount: guild.members.length,
        }
      })

      return NextResponse.json(guildsWithEP.sort((a, b) => b.calculatedEP - a.calculatedEP))
    }

    // Все гильдии
    const guilds = await prisma.guild.findMany({
      where: { isActive: true },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          take: 5,
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { totalEP: 'desc' },
    })

    return NextResponse.json(guilds)
  } catch (error) {
    console.error('Ошибка получения гильдий:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

