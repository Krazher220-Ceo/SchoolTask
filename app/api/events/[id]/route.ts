import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  ministry: z.enum(['LAW_AND_ORDER', 'INFORMATION', 'SPORT', 'CARE']).optional().nullable(),
  category: z.string().min(1).optional(),
  date: z.string().optional(),
  location: z.string().optional().nullable(),
  maxParticipants: z.number().int().min(1).optional().nullable(),
  status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
})

// GET - получить мероприятие по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          include: {
            event: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Мероприятие не найдено' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Ошибка при получении мероприятия:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// PATCH - обновить мероприятие
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может обновлять мероприятия
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateEventSchema.parse(body)

    const updateData: any = {}
    if (data.title) updateData.title = data.title
    if (data.description) updateData.description = data.description
    if (data.ministry !== undefined) updateData.ministry = data.ministry
    if (data.category) updateData.category = data.category
    if (data.date) updateData.date = new Date(data.date)
    if (data.location !== undefined) updateData.location = data.location
    if (data.maxParticipants !== undefined) updateData.maxParticipants = data.maxParticipants
    if (data.status) updateData.status = data.status

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(event)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при обновлении мероприятия:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// DELETE - удалить мероприятие
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может удалять мероприятия
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Мероприятие удалено' })
  } catch (error) {
    console.error('Ошибка при удалении мероприятия:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

