import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ministry: z.enum(['LAW_AND_ORDER', 'INFORMATION', 'SPORT', 'CARE']).optional().nullable(),
  category: z.string().min(1),
  date: z.string(),
  location: z.string().optional().nullable(),
  maxParticipants: z.number().int().min(1).optional().nullable(),
  status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
})

// GET - получить мероприятия
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const ministry = searchParams.get('ministry')
    const limit = searchParams.get('limit')

    const where: any = {}
    if (status) where.status = status
    if (ministry) where.ministry = ministry

    const events = await prisma.event.findMany({
      where,
      include: {
        participants: {
          include: {
            event: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Ошибка при получении мероприятий:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST - создать мероприятие
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может создавать мероприятия
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = eventSchema.parse(body)

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        ministry: data.ministry || null,
        category: data.category,
        date: new Date(data.date),
        location: data.location || null,
        maxParticipants: data.maxParticipants || null,
        status: data.status || 'UPCOMING',
        createdById: session.user.id,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при создании мероприятия:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}


