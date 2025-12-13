import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить рекомендации для пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Анализируем историю задач пользователя
    const userTasks = await prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: session.user.id },
          { createdById: session.user.id },
        ],
      },
      include: {
        reports: {
          where: {
            status: 'APPROVED',
          },
        },
      },
      take: 50,
    })

    // Определяем интересы пользователя
    const interests: Record<string, number> = {}
    userTasks.forEach(task => {
      if (task.ministry) {
        interests[task.ministry] = (interests[task.ministry] || 0) + 1
      }
      if (task.tags) {
        try {
          const tags = JSON.parse(task.tags)
          tags.forEach((tag: string) => {
            interests[tag] = (interests[tag] || 0) + 1
          })
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }
    })

    const topInterests = Object.entries(interests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category)

    // Рекомендуем задачи на основе интересов
    const recommendedTasks = await prisma.task.findMany({
      where: {
        status: { in: ['NEW', 'IN_PROGRESS'] },
        targetAudience: { in: ['STUDENT', 'PUBLIC'] },
        OR: topInterests.length > 0
          ? [
              { ministry: { in: topInterests } },
              { tags: { contains: topInterests[0] } },
            ]
          : undefined,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Рекомендуем министерство
    const recommendedMinistry = topInterests[0] || null

    // Сохраняем рекомендации
    for (const task of recommendedTasks) {
      await prisma.recommendation.upsert({
        where: {
          userId_type_itemId: {
            userId: session.user.id,
            type: 'TASK',
            itemId: task.id,
          },
        },
        create: {
          userId: session.user.id,
          type: 'TASK',
          itemId: task.id,
          score: 0.8,
          reason: `Соответствует твоим интересам: ${topInterests.join(', ')}`,
        },
        update: {
          score: 0.8,
          shownAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      tasks: recommendedTasks,
      ministry: recommendedMinistry,
      interests: topInterests,
      reason: `На основе твоих ${userTasks.length} выполненных задач`,
    })
  } catch (error) {
    console.error('Ошибка получения рекомендаций:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

