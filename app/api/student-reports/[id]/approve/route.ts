import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLevelFromEP, getRankFromEP } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// POST - одобрить отчет ученика и начислить EP
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может одобрять отчеты учеников
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const { feedback } = body

    const report = await prisma.studentReport.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Отчет не найден' }, { status: 404 })
    }

    if (report.status === 'APPROVED') {
      return NextResponse.json({ error: 'Отчет уже одобрен' }, { status: 400 })
    }

    // Проверяем, что EP рассчитан
    if (!report.epAmount || report.epAmount <= 0) {
      return NextResponse.json({ error: 'Не указано количество EP или EP равен 0' }, { status: 400 })
    }

    // Проверяем, не начислялись ли уже баллы (защита от дублирования)
    const reason = report.type === 'GRADE_PHOTO' 
      ? `Балл за предмет ${report.subject || 'не указан'}: ${report.grade} баллов`
      : report.type === 'SOR'
      ? `СОР по предмету ${report.subject || 'не указан'}: ${report.grade} баллов`
      : report.taskId
      ? `Выполнение задачи: ${report.task?.title || 'задача'}`
      : 'Другое'

    const existingEP = await prisma.eventPoint.findFirst({
      where: {
        userId: report.userId,
        eventId: report.taskId || null,
        reason: { contains: report.taskId ? report.task?.title : (report.subject || '') },
      },
    })

    // Начисляем EP только если еще не начислялись
    if (!existingEP) {
      await prisma.eventPoint.create({
        data: {
          userId: report.userId,
          amount: report.epAmount,
          reason,
          eventId: report.taskId || null,
        },
      })
    }

    // Получаем общий EP пользователя
    const totalEP = await prisma.eventPoint.aggregate({
      where: { userId: report.userId },
      _sum: { amount: true },
    })

    // Обновляем отчет
    await prisma.studentReport.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        feedback: feedback || null,
        reviewedById: session.user.id,
      },
    })

    // Отправляем уведомление в Telegram
    try {
      const { notifyReportStatus } = await import('@/telegram/bot')
      await notifyReportStatus(report.userId, params.id, 'APPROVED', report.epAmount, feedback || undefined)
    } catch (error) {
      console.error('Ошибка отправки Telegram уведомления:', error)
    }

    return NextResponse.json({
      success: true,
      epAwarded: report.epAmount,
      totalEP: totalEP._sum.amount || 0,
    })
  } catch (error) {
    console.error('Ошибка при одобрении отчета:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST - отклонить отчет ученика
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const { feedback } = body

    const report = await prisma.studentReport.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    await prisma.studentReport.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        feedback: feedback || 'Отчет отклонен',
        reviewedById: session.user.id,
      },
    })

    // Отправляем уведомление в Telegram
    if (report) {
      try {
        const { notifyReportStatus } = await import('@/telegram/bot')
        await notifyReportStatus(report.userId, params.id, 'REJECTED', undefined, feedback || 'Отчет отклонен')
      } catch (error) {
        console.error('Ошибка отправки Telegram уведомления:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка при отклонении отчета:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

