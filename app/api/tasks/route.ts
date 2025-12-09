import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ministry: z.enum(['LAW_AND_ORDER', 'INFORMATION', 'SPORT', 'CARE', 'STUDENTS']).optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  deadline: z.string().optional().nullable(),
  xpReward: z.number().int().min(0).optional().nullable(),
  epReward: z.number().int().min(0).optional().nullable(),
  targetAudience: z.enum(['PARLIAMENT_MEMBER', 'STUDENT', 'PUBLIC']).default('PARLIAMENT_MEMBER'),
  taskType: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
  tags: z.array(z.string()).optional().nullable(),
})

// GET - получить задачи
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ministry = searchParams.get('ministry')
    const status = searchParams.get('status')
    const assignedToId = searchParams.get('assignedToId')
    const targetAudience = searchParams.get('targetAudience')

    const where: any = {}
    if (ministry) where.ministry = ministry
    if (status) where.status = status
    if (assignedToId) where.assignedToId = assignedToId
    if (targetAudience) where.targetAudience = targetAudience

    // Разделяем задачи: министерства видят только свои, ученики - только свои
    if (session.user.role === 'STUDENT') {
      // Обычные ученики видят только задачи для учеников и общественные (без министерств или для учеников)
      where.OR = [
        { targetAudience: 'STUDENT' },
        {
          targetAudience: 'PUBLIC',
          OR: [
            { ministry: null },
            { ministry: 'STUDENTS' },
          ],
        },
      ]
    } else if (session.user.parliamentMember) {
      // Участники парламента видят только задачи министерств (не видят задачи для учеников)
      where.OR = [
        { assignedToId: session.user.id },
        {
          ministry: session.user.parliamentMember.ministry,
          targetAudience: 'PARLIAMENT_MEMBER',
        },
        {
          targetAudience: 'PUBLIC',
          OR: [
            { ministry: null },
            { ministry: session.user.parliamentMember.ministry },
          ],
        },
      ]
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        reports: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        publicTaskInstances: {
          where: {
            userId: session.user.id,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Применяем приоритет для участников парламента
    if (session.user.parliamentMember) {
      const userMinistry = session.user.parliamentMember.ministry
      tasks.sort((a, b) => {
        // Приоритет по министерству
        const aIsMyMinistry = a.ministry === userMinistry ? 1 : 0
        const bIsMyMinistry = b.ministry === userMinistry ? 1 : 0
        if (aIsMyMinistry !== bIsMyMinistry) {
          return bIsMyMinistry - aIsMyMinistry
        }
        
        // Приоритет по важности
        const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    }

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Ошибка при получении задач:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST - создать задачу
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN и MINISTER могут создавать задачи
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MINISTER') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = taskSchema.parse(body)

    // Если MINISTER, проверяем что задача для его министерства (только для задач парламенту)
    if (session.user.role === 'MINISTER' && session.user.parliamentMember && data.targetAudience === 'PARLIAMENT_MEMBER') {
      if (data.ministry !== session.user.parliamentMember.ministry) {
        return NextResponse.json({ 
          error: 'Вы можете создавать задачи только для своего министерства' 
        }, { status: 403 })
      }
    }

    // Для задач ученикам министерство не требуется, но EP обязателен
    // Для общественных задач министерство опционально (может быть для всех, для конкретного министерства, или 'STUDENTS' для учеников)
    if (data.targetAudience === 'STUDENT' || data.targetAudience === 'PUBLIC') {
      if (!data.epReward || data.epReward <= 0) {
        return NextResponse.json({ 
          error: 'Для задач ученикам необходимо указать EP награду (больше 0)' 
        }, { status: 400 })
      }
      // Общественные задачи всегда PUBLIC типа
      if (data.targetAudience === 'PUBLIC') {
        data.taskType = 'PUBLIC'
        // Для общественных задач министерство опционально:
        // null = для всех (министерства + ученики)
        // 'STUDENTS' = только для учеников
        // конкретное министерство = только для этого министерства
        if (data.ministry === 'STUDENTS') {
          data.ministry = 'STUDENTS' // Сохраняем как строку 'STUDENTS'
        }
      }
    }

    // Для задач парламенту XP обязателен
    if (data.targetAudience === 'PARLIAMENT_MEMBER') {
      if (!data.ministry) {
        return NextResponse.json({ 
          error: 'Для задач парламенту необходимо указать министерство' 
        }, { status: 400 })
      }
      if (!data.xpReward || data.xpReward <= 0) {
        return NextResponse.json({ 
          error: 'Для задач парламенту необходимо указать XP награду (больше 0)' 
        }, { status: 400 })
      }
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        ministry: data.ministry || null,
        assignedToId: data.assignedToId,
        createdById: session.user.id,
        priority: data.priority,
        deadline: data.deadline ? new Date(data.deadline) : null,
        xpReward: data.xpReward || 0,
        epReward: data.epReward || null,
        targetAudience: data.targetAudience,
        taskType: data.taskType || 'PRIVATE',
        tags: data.tags ? JSON.stringify(data.tags) : null,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Отправляем уведомления министерству, если задача для парламента
    if (data.targetAudience === 'PARLIAMENT_MEMBER' && data.ministry) {
      try {
        const { notifyMinistryAboutTask } = await import('@/telegram/bot')
        await notifyMinistryAboutTask(task.id, data.ministry)
      } catch (error) {
        console.error('Ошибка отправки уведомления в Telegram:', error)
        // Не прерываем создание задачи из-за ошибки уведомления
      }
    }

    // Уведомляем админа о создании задачи
    try {
      const { notifyAdminAboutAction } = await import('@/telegram/bot')
      await notifyAdminAboutAction(
        'Создана новая задача',
        `Задача "${task.title}" создана пользователем ${session.user.name}`,
        {
          taskId: task.id,
          targetAudience: task.targetAudience,
          ministry: task.ministry,
        }
      )
    } catch (error) {
      console.error('Ошибка отправки уведомления админу:', error)
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при создании задачи:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

