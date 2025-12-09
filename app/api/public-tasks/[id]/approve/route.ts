import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const approveSchema = z.object({
  feedback: z.string().optional(),
})

// POST - одобрить выполнение общественной задачи
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await req.json()
    const { feedback } = approveSchema.parse(body)

    const instance = await prisma.publicTaskInstance.findUnique({
      where: { id: params.id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            epReward: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            telegramId: true,
          },
        },
      },
    })

    if (!instance) {
      return NextResponse.json({ error: 'Инстанс задачи не найден' }, { status: 404 })
    }

    if (instance.status !== 'IN_REVIEW') {
      return NextResponse.json({ error: 'Задача не на проверке' }, { status: 400 })
    }

    // Проверяем, не начислялись ли уже баллы (защита от дублирования)
    const existingEP = await prisma.eventPoint.findFirst({
      where: {
        userId: instance.user.id,
        eventId: instance.taskId,
        reason: { contains: instance.task.title },
      },
    })

    // Начисляем EP только если еще не начислялись
    if (!existingEP && instance.task.epReward && instance.task.epReward > 0) {
      await prisma.eventPoint.create({
        data: {
          userId: instance.user.id,
          amount: instance.task.epReward,
          reason: `Выполнение общественной задачи: ${instance.task.title}`,
          eventId: instance.taskId,
        },
      })
    }

    // Обновляем инстанс
    const updated = await prisma.publicTaskInstance.update({
      where: { id: params.id },
      data: {
        status: 'COMPLETED',
        feedback: feedback || null,
        reviewedById: session.user.id,
      },
    })

    // Отправляем уведомление в Telegram пользователю
    if (instance.user.telegramId) {
      try {
        const { notifyReportStatus } = await import('@/telegram/bot')
        await notifyReportStatus(
          instance.user.id,
          params.id,
          'APPROVED',
          instance.task.epReward || 0,
          feedback
        )
      } catch (error) {
        console.error('Ошибка отправки Telegram уведомления:', error)
      }
    }

    // Уведомляем админа об одобрении общественной задачи
    try {
      const { notifyAdminAboutAction } = await import('@/telegram/bot')
      await notifyAdminAboutAction(
        'Одобрена общественная задача',
        `Общественная задача "${instance.task.title}" одобрена для пользователя ${instance.user.name}`,
        {
          instanceId: params.id,
          taskId: instance.taskId,
          userId: instance.user.id,
          epReward: instance.task.epReward,
        }
      )
    } catch (error) {
      console.error('Ошибка отправки уведомления админу:', error)
    }

    return NextResponse.json({
      success: true,
      instance: updated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при одобрении задачи:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// DELETE - отклонить выполнение общественной задачи
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await req.json()
    const { feedback } = z.object({ feedback: z.string().optional() }).parse(body)

    const instance = await prisma.publicTaskInstance.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            telegramId: true,
          },
        },
      },
    })

    if (!instance) {
      return NextResponse.json({ error: 'Инстанс задачи не найден' }, { status: 404 })
    }

    await prisma.publicTaskInstance.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        feedback: feedback || 'Задача отклонена',
        reviewedById: session.user.id,
      },
    })

    // Отправляем уведомление в Telegram
    if (instance.user.telegramId) {
      try {
        const { notifyReportStatus } = await import('@/telegram/bot')
        await notifyReportStatus(
          instance.user.id,
          params.id,
          'REJECTED',
          undefined,
          feedback || 'Задача отклонена'
        )
      } catch (error) {
        console.error('Ошибка отправки Telegram уведомления:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при отклонении задачи:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

