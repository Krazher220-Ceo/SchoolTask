import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

const verifySchema = z.object({
  loginOrEmail: z.string().min(1),
  code: z.string().length(6),
  newPassword: z.string().min(8),
})

// POST - проверить код и изменить пароль
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = verifySchema.parse(body)

    // Ищем пользователя
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.loginOrEmail },
          { 
            registrationRequest: {
              login: data.loginOrEmail,
            },
          },
        ],
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // В реальном приложении здесь должна быть проверка кода из базы данных
    // Для демонстрации просто проверяем формат кода
    if (!/^\d{6}$/.test(data.code)) {
      return NextResponse.json({ error: 'Неверный формат кода' }, { status: 400 })
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    // Обновляем пароль
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: 'Пароль успешно изменен' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при сбросе пароля:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

