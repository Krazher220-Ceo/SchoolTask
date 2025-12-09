import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - получить рейтинги
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'XP' // XP или EP
    const period = searchParams.get('period') || 'all' // all, month, quarter, year
    const ministry = searchParams.get('ministry')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (type === 'XP') {
      // Рейтинг по XP (члены парламента)
      const where: any = {
        isActive: true,
      }
      if (ministry) {
        where.ministry = ministry
      }

      const members = await prisma.parliamentMember.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              class: true,
            },
          },
        },
        orderBy: {
          xp: 'desc',
        },
        take: limit,
      })

      return NextResponse.json(
        members.map((member, index) => ({
          position: index + 1,
          userId: member.userId,
          name: member.user.name,
          email: member.user.email,
          class: member.user.class,
          ministry: member.ministry,
          xp: member.xp,
          level: member.level,
          rank: member.rank,
        }))
      )
    } else {
      // Рейтинг по EP (все ученики)
      // Подсчитываем EP для каждого пользователя
      const users = await prisma.user.findMany({
        include: {
          eventPoints: true,
        },
      })

      const usersWithEP = users
        .map((user) => {
          const totalEP = user.eventPoints.reduce((sum, ep) => sum + ep.amount, 0)
          return {
            userId: user.id,
            name: user.name,
            email: user.email,
            class: user.class,
            ep: totalEP,
          }
        })
        .filter((user) => user.ep > 0)
        .sort((a, b) => b.ep - a.ep)
        .slice(0, limit)
        .map((user, index) => ({
          position: index + 1,
          ...user,
        }))

      return NextResponse.json(usersWithEP)
    }
  } catch (error) {
    console.error('Ошибка при получении рейтингов:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

