import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6).optional(), // Если не указан, генерируется автоматически
  regenerate: z.boolean().optional(), // Если true, генерирует новый пароль
})

// GET - получить пароль пользователя (без сброса, если пароль уже был сохранен)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может получать пароли
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    // Проверяем, есть ли сохраненный пароль в базе (в поле login или другом месте)
    // Если нет - возвращаем null, чтобы админ мог регенерировать
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Пароль не хранится в открытом виде, поэтому возвращаем null
    // Админ должен использовать POST для регенерации
    return NextResponse.json({
      success: true,
      password: null,
      message: 'Используйте POST для получения/регенерации пароля',
    })
  } catch (error) {
    console.error('Ошибка при получении пароля:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST - регенерировать пароль пользователя (только если явно запрошено)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может регенерировать пароли
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
      message: 'Пароль успешно регенерирован',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при регенерации пароля:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

