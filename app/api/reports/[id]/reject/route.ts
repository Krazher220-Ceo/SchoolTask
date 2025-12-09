import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const rejectSchema = z.object({
  feedback: z.string().min(1, 'Необходимо указать причину отклонения'),
})

// POST - отклонить отчет
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN и MINISTER могут отклонять отчеты
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MINISTER') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const { feedback } = rejectSchema.parse(body)

    const report = await prisma.taskReport.findUnique({
      where: { id: params.id },
      include: {
        task: true,
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Отчет не найден' }, { status: 404 })
    }

    // Обновляем отчет
    const updatedReport = await prisma.taskReport.update({
      where: { id: params.id },
      data: {
        status: 'NEEDS_REVISION',
        feedback,
      },
    })

    // Возвращаем задачу в работу
    await prisma.task.update({
      where: { id: report.taskId },
      data: { status: 'IN_PROGRESS' },
    })

    return NextResponse.json({
      report: updatedReport,
      message: 'Отчет отклонен, требуется доработка',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при отклонении отчета:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

