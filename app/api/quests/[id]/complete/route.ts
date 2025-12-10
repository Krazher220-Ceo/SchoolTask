import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const completeSchema = z.object({
  proof: z.string().min(10, 'Необходимо предоставить доказательство выполнения (минимум 10 символов)'),
  // В будущем здесь можно добавить фото, видео, ссылки и т.д.
})

// POST - сдать квест
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ученики могут сдавать квесты
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Только ученики могут сдавать квесты' }, { status: 403 })
    }

    const body = await request.json()
    const data = completeSchema.parse(body)

    // Находим назначенный квест
    const assignedQuest = await prisma.assignedQuest.findFirst({
      where: {
        questId: params.id,
        userId: session.user.id,
        completed: false, // Только незавершенные
      },
      include: {
        quest: true,
      },
    })

    if (!assignedQuest) {
      return NextResponse.json({ 
        error: 'Квест не найден или уже выполнен' 
      }, { status: 404 })
    }

    // Проверяем, что квест активен
    if (!assignedQuest.quest.isActive) {
      return NextResponse.json({ 
        error: 'Этот квест больше не активен' 
      }, { status: 400 })
    }

    // Помечаем квест как выполненный
    await prisma.assignedQuest.update({
      where: { id: assignedQuest.id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    })

    // Начисляем EP
    if (assignedQuest.quest.epReward > 0) {
      await prisma.eventPoint.create({
        data: {
          userId: session.user.id,
          amount: assignedQuest.quest.epReward,
          reason: `Выполнен квест: ${assignedQuest.quest.name} (${assignedQuest.quest.type})`,
          eventId: null,
        },
      })

      // Отправляем уведомление в Telegram, если есть
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { telegramId: true },
      })

      if (user?.telegramId) {
        try {
          const { sendTelegramMessage } = await import('@/telegram/bot')
          await sendTelegramMessage(
            parseInt(user.telegramId),
            `✅ Квест выполнен!\n\n${assignedQuest.quest.name}\n\nНачислено: ${assignedQuest.quest.epReward} EP`
          )
        } catch (error) {
          console.error('Ошибка отправки Telegram уведомления:', error)
        }
      }
    }

    // В будущем здесь можно добавить проверку через ИИ
    // Например, если квест связан с чтением книги, можно проверить понимание через вопросы

    return NextResponse.json({
      success: true,
      message: 'Квест успешно выполнен!',
      epAwarded: assignedQuest.quest.epReward,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Неверные данные', 
        details: error.errors 
      }, { status: 400 })
    }
    console.error('Ошибка при выполнении квеста:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

