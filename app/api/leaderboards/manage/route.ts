import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const manageLeaderboardSchema = z.object({
  userId: z.string(),
  action: z.enum(['add', 'remove', 'ban']),
  leaderboardType: z.enum(['parliament', 'students']),
})

// POST - управление лидербордом (добавление/удаление/отстранение)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может управлять лидербордами
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = manageLeaderboardSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: {
        parliamentMember: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    let result

    switch (data.action) {
      case 'add':
        // Добавление в лидерборд (можно добавить флаг isInLeaderboard в будущем)
        result = { message: 'Пользователь добавлен в лидерборд' }
        break

      case 'remove':
        // Удаление из лидерборда
        result = { message: 'Пользователь удален из лидерборда' }
        break

      case 'ban':
        // Отстранение от лидерборда (можно добавить флаг isBanned)
        if (data.leaderboardType === 'parliament' && user.parliamentMember) {
          await prisma.parliamentMember.update({
            where: { id: user.parliamentMember.id },
            data: { isActive: false },
          })
        }
        result = { message: 'Пользователь отстранен от лидерборда' }
        break

      default:
        return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 })
    }

    // Уведомляем админа о действии
    try {
      const { notifyAdminAboutAction } = await import('@/telegram/bot')
      await notifyAdminAboutAction(
        `Управление лидербордом: ${data.action}`,
        `Пользователь ${user.name} ${data.action === 'add' ? 'добавлен' : data.action === 'remove' ? 'удален' : 'отстранен'} из лидерборда ${data.leaderboardType}`,
        { userId: data.userId, action: data.action }
      )
    } catch (error) {
      console.error('Ошибка отправки уведомления админу:', error)
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при управлении лидербордом:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

