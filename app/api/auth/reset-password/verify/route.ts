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

    // Проверяем код в базе данных
    const resetCode = await prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        code: data.code,
        expiresAt: {
          gt: new Date(), // Код еще не истек
        },
        used: false,
      },
    })

    if (!resetCode) {
      return NextResponse.json({ error: 'Неверный или истекший код' }, { status: 400 })
    }

    // Помечаем код как использованный
    await prisma.passwordResetCode.update({
      where: { id: resetCode.id },
      data: { used: true },
    })

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

