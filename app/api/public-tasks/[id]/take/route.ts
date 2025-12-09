import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - взять общественную задачу (создать свой инстанс)
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

    if (task.taskType !== 'PUBLIC') {
      return NextResponse.json({ error: 'Это не общественная задача' }, { status: 400 })
    }

    // Проверяем, не взял ли уже пользователь эту задачу
    const existing = await prisma.publicTaskInstance.findUnique({
      where: {
        taskId_userId: {
          taskId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Вы уже взяли эту задачу' }, { status: 400 })
    }

    // Создаем инстанс задачи
    const instance = await prisma.publicTaskInstance.create({
      data: {
        taskId: params.id,
        userId: session.user.id,
        status: 'NEW',
      },
      include: {
        task: {
          select: {
            title: true,
            description: true,
            epReward: true,
          },
        },
      },
    })

    return NextResponse.json(instance, { status: 201 })
  } catch (error) {
    console.error('Ошибка при взятии задачи:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

