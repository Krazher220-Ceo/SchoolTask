import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLevelFromXP } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// POST - одобрить отчет и начислить XP
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN и MINISTER могут одобрять отчеты
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MINISTER') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const { quality, bonusXP = 0 } = body

    const report = await prisma.taskReport.findUnique({
      where: { id: params.id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            assignedToId: true,
            xpReward: true,
            targetAudience: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Отчет не найден' }, { status: 404 })
    }

    // Обновляем отчет
    const updatedReport = await prisma.taskReport.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        quality: quality || null,
      },
    })

    // Начисляем XP только для задач парламенту
    if (report.task.targetAudience === 'PARLIAMENT_MEMBER' && report.task.assignedToId) {
      // Проверяем, что пользователь является членом парламента
      const member = await prisma.parliamentMember.findUnique({
        where: { userId: report.task.assignedToId },
      })

      if (member) {
        const totalXP = report.task.xpReward + bonusXP
        
        // Обновляем XP пользователя
        const updatedMember = await prisma.parliamentMember.update({
          where: { userId: report.task.assignedToId },
          data: {
            xp: {
              increment: totalXP,
            },
          },
        })

        // Получаем новый уровень
        const { level, rank } = getLevelFromXP(updatedMember.xp)

        // Обновляем уровень и ранг
        await prisma.parliamentMember.update({
          where: { userId: report.task.assignedToId },
          data: {
            level,
            rank,
          },
        })

        // Создаем запись в истории XP
        await prisma.xPHistory.create({
          data: {
            userId: report.task.assignedToId,
            amount: totalXP,
            reason: `Выполнение задачи: ${report.task.title}`,
            source: 'task',
            sourceId: report.taskId,
          },
        })
      }
    }

    // Обновляем статус задачи на "Выполнено"
    await prisma.task.update({
      where: { id: report.taskId },
      data: { status: 'COMPLETED' },
    })

    return NextResponse.json({
      report: updatedReport,
      message: 'Отчет одобрен, XP начислены',
    })
  } catch (error) {
    console.error('Ошибка при одобрении отчета:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

