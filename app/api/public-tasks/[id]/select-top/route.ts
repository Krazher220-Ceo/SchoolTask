import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const selectTopSchema = z.object({
  instanceIds: z.array(z.string()).min(1), // Массив ID инстансов для топа
})

// POST - выбрать топ из всех приславших заданий (до дедлайна)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = selectTopSchema.parse(body)

    // Получаем задачу
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        topRanking: true,
        deadline: true,
        epReward: true,
        taskType: true,
        createdById: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 })
    }

    if (task.taskType !== 'PUBLIC') {
      return NextResponse.json({ error: 'Это не общественная задача' }, { status: 400 })
    }

    if (!task.topRanking) {
      return NextResponse.json({ error: 'Для этой задачи не установлен топ рейтинг' }, { status: 400 })
    }

    // Проверяем, что дедлайн еще не прошел
    if (task.deadline && new Date(task.deadline) < new Date()) {
      return NextResponse.json({ error: 'Дедлайн уже прошел, нельзя изменить топ' }, { status: 400 })
    }

    // Проверяем количество выбранных инстансов
    if (data.instanceIds.length > task.topRanking) {
      return NextResponse.json({ 
        error: `Можно выбрать максимум ${task.topRanking} инстансов для топа ${task.topRanking}` 
      }, { status: 400 })
    }

    // Проверяем, что все инстансы существуют и относятся к этой задаче
    const instances = await prisma.publicTaskInstance.findMany({
      where: {
        id: { in: data.instanceIds },
        taskId: params.id,
        status: 'COMPLETED', // Только завершенные задачи могут быть в топе
      },
    })

    if (instances.length !== data.instanceIds.length) {
      return NextResponse.json({ 
        error: 'Некоторые инстансы не найдены или не завершены' 
      }, { status: 400 })
    }

    // Обновляем позиции в топе
    for (let i = 0; i < instances.length; i++) {
      await prisma.publicTaskInstance.update({
        where: { id: instances[i].id },
        data: {
          topPosition: i + 1, // Позиция 1, 2, 3, ...
        },
      })
    }

    // Сохраняем выбранные инстансы в задаче
    await prisma.task.update({
      where: { id: params.id },
      data: {
        selectedTopInstances: JSON.stringify(data.instanceIds),
      },
    })

    // Отправляем уведомление админу
    try {
      const { sendTelegramMessage } = await import('@/telegram/bot')
      // Отправляем уведомление создателю задачи, если у него есть Telegram
      const taskCreator = await prisma.user.findUnique({
        where: { id: task.createdById },
        select: { telegramId: true },
      })
      if (taskCreator?.telegramId) {
        await sendTelegramMessage(
          parseInt(taskCreator.telegramId),
          `🏆 Выбран топ ${task.topRanking} для задачи "${task.title}". Выбрано ${instances.length} инстансов.`
        )
      }
    } catch (error) {
      console.error('Ошибка отправки Telegram уведомления:', error)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Топ ${task.topRanking} успешно выбран`,
      instances: instances.map((inst, idx) => ({
        id: inst.id,
        position: idx + 1,
      })),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при выборе топа:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

