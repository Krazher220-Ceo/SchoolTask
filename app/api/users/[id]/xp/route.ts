import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getLevelFromXP } from '@/lib/utils'

const awardXPSchema = z.object({
  amount: z.number().int().min(1),
  reason: z.string().optional(),
})

// POST - выдать XP пользователю
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может выдавать XP
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = awardXPSchema.parse(body)

    // Проверяем, что пользователь существует и является участником парламента
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { parliamentMember: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    if (!user.parliamentMember) {
      return NextResponse.json({ error: 'Пользователь не является участником парламента' }, { status: 400 })
    }

    // Обновляем XP
    const updatedMember = await prisma.parliamentMember.update({
      where: { userId: params.id },
      data: {
        xp: {
          increment: data.amount,
        },
      },
    })

    // Получаем новый уровень
    const { level, rank } = getLevelFromXP(updatedMember.xp)

    // Обновляем уровень и ранг
    await prisma.parliamentMember.update({
      where: { userId: params.id },
      data: {
        level,
        rank,
      },
    })

    // Создаем запись в истории XP
    await prisma.xPHistory.create({
      data: {
        userId: params.id,
        amount: data.amount,
        reason: data.reason || `Начислено администратором`,
        source: 'admin',
        sourceId: session.user.id,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: `Начислено ${data.amount} XP`,
      xp: updatedMember.xp + data.amount,
      level,
      rank,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при выдаче XP:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

