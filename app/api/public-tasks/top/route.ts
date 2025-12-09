import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить топ выполненных общественных задач
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const ministry = searchParams.get('ministry')

    if (!taskId) {
      return NextResponse.json({ error: 'Не указан ID задачи' }, { status: 400 })
    }

    // Получаем задачу
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        ministry: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 })
    }

    // Получаем топ выполненных инстансов этой задачи
    const where: any = {
      taskId,
      status: 'COMPLETED',
    }

    // Если указано министерство, фильтруем по нему
    if (ministry) {
      where.user = {
        parliamentMember: {
          ministry: ministry,
        },
      }
    }

    const topInstances = await prisma.publicTaskInstance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            class: true,
            fullClass: true,
            parliamentMember: {
              select: {
                ministry: true,
                position: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc', // Первые выполнившие
      },
      take: limit,
    })

    return NextResponse.json({
      task,
      top: topInstances,
      total: topInstances.length,
    })
  } catch (error) {
    console.error('Ошибка при получении топа:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

