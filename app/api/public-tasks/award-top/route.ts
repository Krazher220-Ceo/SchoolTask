import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - начислить баллы за топ после дедлайна (автоматически или вручную)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const taskId = body.taskId

    if (!taskId) {
      return NextResponse.json({ error: 'Не указан ID задачи' }, { status: 400 })
    }

    // Получаем задачу
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        topRanking: true,
        deadline: true,
        epReward: true,
        topAwarded: true,
        selectedTopInstances: true,
        taskType: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 })
    }

    if (!task || task.taskType !== 'PUBLIC') {
      return NextResponse.json({ error: 'Задача не найдена или это не общественная задача' }, { status: 404 })
    }

    if (!task.topRanking) {
      return NextResponse.json({ error: 'Для этой задачи не установлен топ рейтинг' }, { status: 400 })
    }

    if (task.topAwarded) {
      return NextResponse.json({ error: 'Баллы за топ уже начислены' }, { status: 400 })
    }

    // Проверяем, что дедлайн прошел
    if (task.deadline && new Date(task.deadline) > new Date()) {
      return NextResponse.json({ error: 'Дедлайн еще не прошел' }, { status: 400 })
    }

    // Получаем инстансы с позициями в топе
    const topInstances = await prisma.publicTaskInstance.findMany({
      where: {
        taskId: taskId,
        topPosition: { not: null },
        status: 'COMPLETED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            telegramId: true,
          },
        },
      },
      orderBy: {
        topPosition: 'asc',
      },
      take: task.topRanking,
    })

    if (topInstances.length === 0) {
      return NextResponse.json({ error: 'Топ еще не выбран' }, { status: 400 })
    }

    // Процент награды для каждой позиции
    const rewardPercentages: Record<number, number> = {
      1: 100, // 1 место - 100%
      2: 50,  // 2 место - 50%
      3: 25,  // 3 место - 25%
      4: 15,  // 4 место - 15%
      5: 10,  // 5 место - 10%
      6: 8,   // 6 место - 8%
      7: 6,   // 7 место - 6%
      8: 5,   // 8 место - 5%
      9: 4,   // 9 место - 4%
      10: 3,  // 10 место - 3%
    }

    // Начисляем баллы
    const awarded = []
    for (const instance of topInstances) {
      if (!instance.topPosition || !task.epReward) continue

      const percentage = rewardPercentages[instance.topPosition] || 0
      const epAmount = Math.floor((task.epReward * percentage) / 100)

      if (epAmount > 0) {
        // Проверяем, не начислялись ли уже баллы за этот топ
        if (!instance.topAwarded) {
          await prisma.eventPoint.create({
            data: {
              userId: instance.userId,
              amount: epAmount,
              reason: `Топ ${instance.topPosition} в задаче "${task.title}" (${percentage}% от ${task.epReward} EP)`,
              eventId: null, // Для задач не привязываем к событию
            },
          })

          // Помечаем инстанс как награжденный
          await prisma.publicTaskInstance.update({
            where: { id: instance.id },
            data: { topAwarded: true },
          })

          // Отправляем уведомление пользователю
          if (instance.user.telegramId) {
            try {
              const { sendTelegramMessage } = await import('@/telegram/bot')
              await sendTelegramMessage(
                parseInt(instance.user.telegramId),
                `🏆 Поздравляем! Вы заняли ${instance.topPosition} место в топе задачи "${task.title}"!\n\nНачислено: ${epAmount} EP (${percentage}% от ${task.epReward} EP)`
              )
            } catch (error) {
              console.error('Ошибка отправки Telegram уведомления:', error)
            }
          }

          awarded.push({
            userId: instance.userId,
            userName: instance.user.name,
            position: instance.topPosition,
            epAmount,
            percentage,
          })
        }
      }
    }

    // Помечаем задачу как награжденную
    await prisma.task.update({
      where: { id: taskId },
      data: {
        topAwarded: true,
      },
    })

    // Отправляем уведомление создателю задачи
    try {
      const { sendTelegramMessage } = await import('@/telegram/bot')
      const taskCreator = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
          createdBy: {
            select: { telegramId: true },
          },
        },
      })
      if (taskCreator?.createdBy?.telegramId) {
        await sendTelegramMessage(
          parseInt(taskCreator.createdBy.telegramId),
          `🎉 Начислены баллы за топ ${task.topRanking} в задаче "${task.title}". Награждено ${awarded.length} участников.`
        )
      }
    } catch (error) {
      console.error('Ошибка отправки Telegram уведомления:', error)
    }

    return NextResponse.json({
      success: true,
      message: `Баллы за топ успешно начислены`,
      awarded,
    })
  } catch (error) {
    console.error('Ошибка при начислении баллов за топ:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

