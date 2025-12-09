import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const submitSchema = z.object({
  videoUrl: z.string().url().optional().nullable(),
  workLink: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
})

// POST - отправить выполнение общественной задачи
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const data = submitSchema.parse(body)

    if (!data.videoUrl && !data.workLink) {
      return NextResponse.json({ 
        error: 'Необходимо указать либо ссылку на видео, либо ссылку на работу' 
      }, { status: 400 })
    }

    // Находим инстанс задачи пользователя
    const instance = await prisma.publicTaskInstance.findUnique({
      where: {
        taskId_userId: {
          taskId: params.id,
          userId: session.user.id,
        },
      },
      include: {
        task: true,
      },
    })

    if (!instance) {
      return NextResponse.json({ error: 'Задача не найдена или не взята' }, { status: 404 })
    }

    if (instance.status === 'COMPLETED' || instance.status === 'IN_REVIEW') {
      return NextResponse.json({ error: 'Задача уже отправлена на проверку' }, { status: 400 })
    }

    // Обновляем инстанс
    const updated = await prisma.publicTaskInstance.update({
      where: { id: instance.id },
      data: {
        videoUrl: data.videoUrl,
        workLink: data.workLink,
        description: data.description,
        status: 'IN_REVIEW',
      },
      include: {
        task: {
          select: {
            title: true,
            epReward: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при отправке задачи:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

