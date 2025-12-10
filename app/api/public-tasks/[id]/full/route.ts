import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить полную информацию о задаче и инстансе в одном запросе
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Загружаем задачу и инстанс в одном запросе
    const [task, instance] = await Promise.all([
      prisma.task.findUnique({
        where: { id: params.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.publicTaskInstance.findFirst({
        where: {
          taskId: params.id,
          userId: session.user.id,
        },
      }),
    ])

    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 })
    }

    return NextResponse.json({
      task,
      instance: instance || null,
    })
  } catch (error) {
    console.error('Ошибка при получении задачи:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

