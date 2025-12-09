import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const awardEPSchema = z.object({
  amount: z.number().int().min(1),
  reason: z.string().optional(),
})

// POST - выдать EP пользователю
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может выдавать EP
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = awardEPSchema.parse(body)

    // Проверяем, что пользователь существует
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Создаем запись о начислении EP
    await prisma.eventPoint.create({
      data: {
        userId: params.id,
        amount: data.amount,
        reason: data.reason || `Начислено администратором`,
        eventId: null,
      },
    })

    // Получаем общее количество EP пользователя
    const totalEP = await prisma.eventPoint.aggregate({
      where: { userId: params.id },
      _sum: { amount: true },
    })

    return NextResponse.json({ 
      success: true,
      message: `Начислено ${data.amount} EP`,
      totalEP: totalEP._sum.amount || 0,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при выдаче EP:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

