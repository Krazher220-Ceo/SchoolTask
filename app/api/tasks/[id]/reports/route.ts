import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const reportSchema = z.object({
  description: z.string().min(1),
  photos: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  links: z.array(z.string()).optional(),
  timeSpent: z.number().int().min(0).optional(),
})

// POST - создать отчет по задаче
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 })
    }

    // Только назначенный исполнитель может создать отчет
    if (task.assignedToId !== session.user.id) {
      return NextResponse.json({ error: 'Вы не назначены исполнителем этой задачи' }, { status: 403 })
    }

    const body = await request.json()
    const data = reportSchema.parse(body)

    const report = await prisma.taskReport.create({
      data: {
        taskId: params.id,
        userId: session.user.id,
        description: data.description,
        photos: data.photos ? JSON.stringify(data.photos) : null,
        videos: data.videos ? JSON.stringify(data.videos) : null,
        links: data.links ? JSON.stringify(data.links) : null,
        timeSpent: data.timeSpent,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Обновляем статус задачи на "На проверке"
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'IN_REVIEW' },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при создании отчета:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// GET - получить отчеты по задаче
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const reports = await prisma.taskReport.findMany({
      where: { taskId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Ошибка при получении отчетов:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

