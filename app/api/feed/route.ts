import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить ленту событий
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') // all, competitive, collaborative, social, economy
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }

    // Получаем события
    const events = await prisma.feedEvent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            visualEffects: true,
          },
        },
      },
      orderBy: [
        { pinned: 'desc' },
        { highlight: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    })

    // Получаем закрепленные события отдельно
    const pinnedEvents = await prisma.feedEvent.findMany({
      where: { pinned: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            visualEffects: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })

    return NextResponse.json({
      events,
      pinnedEvents,
      hasMore: events.length === limit,
    })
  } catch (error) {
    console.error('Ошибка при получении ленты:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST - создать событие (вызывается автоматически системой)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только система может создавать события
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MINISTER') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, type, title, description, data, category, highlight, pinned } = body

    const event = await prisma.feedEvent.create({
      data: {
        userId,
        type,
        title,
        description,
        data: data ? JSON.stringify(data) : null,
        category,
        highlight: highlight || false,
        pinned: pinned || false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            visualEffects: true,
          },
        },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Ошибка при создании события:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

