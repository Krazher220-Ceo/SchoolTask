import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const telegramLinkSchema = z.object({
  telegramId: z.string(),
  telegramUsername: z.string().optional(),
})

// PATCH - привязать Telegram аккаунт
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может привязывать Telegram или пользователь сам себе
    if (session.user.role !== 'ADMIN' && session.user.id !== params.id) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = telegramLinkSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        telegramId: data.telegramId,
        telegramUsername: data.telegramUsername,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при привязке Telegram:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

