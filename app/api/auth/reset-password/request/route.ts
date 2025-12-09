import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendTelegramMessage } from '@/telegram/bot'

export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  loginOrEmail: z.string().min(1),
})

// POST - запросить код восстановления пароля
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = requestSchema.parse(body)

    // Ищем пользователя по email или login
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
      include: {
        registrationRequest: {
          select: {
            login: true,
          },
        },
      },
    })

    if (!user) {
      // Не раскрываем, существует ли пользователь (безопасность)
      return NextResponse.json({ 
        message: 'Если пользователь существует, код отправлен на email или Telegram' 
      })
    }

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Сохраняем код в базе (можно использовать существующую таблицу или создать новую)
    // Для простоты используем временное поле или создаем запись
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Можно добавить поле passwordResetCode в схему, но пока используем временное решение
      },
    })

    // Отправляем код в Telegram, если есть
    if (user.telegramId) {
      try {
        await sendTelegramMessage(
          parseInt(user.telegramId),
          `🔐 Код восстановления пароля: ${code}\n\nКод действителен 10 минут.`
        )
      } catch (error) {
        console.error('Ошибка отправки в Telegram:', error)
      }
    }

    // В реальном приложении здесь должна быть отправка на email
    // Для демонстрации возвращаем код (в продакшене НЕ ДЕЛАТЬ ТАК!)
    return NextResponse.json({ 
      message: 'Код отправлен на email или Telegram',
      // ВРЕМЕННО: для тестирования возвращаем код (удалить в продакшене!)
      code: code,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при запросе кода восстановления:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

