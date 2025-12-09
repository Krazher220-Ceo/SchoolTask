import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const studentReportSchema = z.object({
  type: z.enum(['GRADE_PHOTO', 'SOR', 'TASK_COMPLETION']),
  subject: z.string().optional(),
  grade: z.number().int().min(0).max(100).optional(),
  description: z.string().optional(),
  photoUrl: z.string().url(),
  telegramFileId: z.string().optional(),
  taskId: z.string().optional(),
})

// POST - создать отчет ученика
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const data = studentReportSchema.parse(body)

    // Рассчитываем EP: 10 баллов = 9 EP (10 - 1, минус 10%)
    let epAmount = 0
    if (data.type === 'GRADE_PHOTO' && data.grade) {
      // 10 баллов = 9 EP, 9 баллов = 8 EP, и т.д.
      epAmount = Math.max(0, data.grade - 1)
    } else if (data.type === 'SOR' && data.grade) {
      // СОР: та же формула
      epAmount = Math.max(0, data.grade - 1)
    } else if (data.type === 'TASK_COMPLETION' && data.taskId) {
      // Для задач EP берется из задачи
      const task = await prisma.task.findUnique({
        where: { id: data.taskId },
        select: { epReward: true },
      })
      epAmount = task?.epReward || 0
    }
    
    // Проверяем, что EP рассчитан
    if (epAmount <= 0 && (data.type === 'GRADE_PHOTO' || data.type === 'SOR')) {
      return NextResponse.json({ 
        error: 'Неверный балл. EP должен быть больше 0' 
      }, { status: 400 })
    }

    const report = await prisma.studentReport.create({
      data: {
        userId: session.user.id,
        type: data.type,
        subject: data.subject,
        grade: data.grade,
        description: data.description,
        photoUrl: data.photoUrl,
        telegramFileId: data.telegramFileId,
        taskId: data.taskId,
        epAmount,
        status: 'PENDING',
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при создании отчета ученика:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// GET - получить отчеты ученика
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    
    // Если не админ, показываем только свои отчеты
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    } else {
      // Админ может фильтровать по статусу
      if (status) {
        where.status = status
      }
    }

    if (type) {
      where.type = type
    }

    const reports = await prisma.studentReport.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            class: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
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

