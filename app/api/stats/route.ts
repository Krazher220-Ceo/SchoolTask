import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateStatsSchema = z.object({
  eventsCount: z.string().optional(),
  membersCount: z.string().optional(),
  ideasCount: z.string().optional(),
})

// GET - получить статистику
export async function GET() {
  try {
    const stats = await prisma.siteStats.findMany({
      where: {
        key: {
          in: ['events_count', 'members_count', 'ideas_count'],
        },
      },
    })

    // Получаем реальное количество завершенных мероприятий админа
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    let actualEventsCount = 0
    if (admin) {
      actualEventsCount = await prisma.event.count({
        where: {
          createdById: admin.id,
          status: 'COMPLETED',
        },
      })
    }

    // Если есть реальные мероприятия, используем их, иначе берем из настроек

    const statsMap: Record<string, string> = {
      events_count: '1',
      members_count: '15+',
      ideas_count: '10+',
    }

    stats.forEach(stat => {
      statsMap[stat.key] = stat.value
    })

    return NextResponse.json({
      eventsCount: actualEventsCount > 0 ? actualEventsCount : (parseInt(statsMap.events_count) || 1),
      membersCount: statsMap.members_count || '15+',
      ideasCount: statsMap.ideas_count || '10+',
      isRealEventsCount: actualEventsCount > 0,
    })
  } catch (error) {
    console.error('Ошибка при получении статистики:', error)
    return NextResponse.json({ 
      eventsCount: 1,
      membersCount: '15+',
      ideasCount: '10+',
      isRealEventsCount: false,
    })
  }
}

// PATCH - обновить статистику (только для админа)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateStatsSchema.parse(body)

    const updates: Promise<any>[] = []

    if (data.eventsCount !== undefined) {
      updates.push(
        prisma.siteStats.upsert({
          where: { key: 'events_count' },
          update: { value: data.eventsCount },
          create: {
            key: 'events_count',
            value: data.eventsCount,
            description: 'Количество проведенных мероприятий',
          },
        })
      )
    }

    if (data.membersCount !== undefined) {
      updates.push(
        prisma.siteStats.upsert({
          where: { key: 'members_count' },
          update: { value: data.membersCount },
          create: {
            key: 'members_count',
            value: data.membersCount,
            description: 'Количество участников парламента',
          },
        })
      )
    }

    if (data.ideasCount !== undefined) {
      updates.push(
        prisma.siteStats.upsert({
          where: { key: 'ideas_count' },
          update: { value: data.ideasCount },
          create: {
            key: 'ideas_count',
            value: data.ideasCount,
            description: 'Количество реализованных идей',
          },
        })
      )
    }

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при обновлении статистики:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

