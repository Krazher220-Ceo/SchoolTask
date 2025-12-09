import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6).optional(), // Если не указан, генерируется автоматически
})

// POST - сбросить/установить пароль пользователя
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может сбрасывать пароли
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = resetPasswordSchema.parse(body)

    // Генерируем пароль, если не указан
    const newPassword = data.newPassword || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Обновляем пароль пользователя
    await prisma.user.update({
      where: { id: params.id },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({
      success: true,
      password: newPassword, // Возвращаем незашифрованный пароль для показа админу
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при сбросе пароля:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

