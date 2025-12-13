import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

const approveSchema = z.object({
  role: z.enum(['STUDENT', 'MEMBER', 'MINISTER']).default('STUDENT'),
  ministry: z.enum(['LAW_AND_ORDER', 'INFORMATION', 'SPORT', 'CARE']).optional().nullable(),
  password: z.string().min(6).optional(), // Если не указан, генерируется автоматически
  class: z.string().optional().nullable(),
  classLetter: z.string().optional().nullable(),
})

// POST - одобрить заявку и создать пользователя
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = approveSchema.parse(body)

    const registrationRequest = await prisma.registrationRequest.findUnique({
      where: { id: params.id },
    })

    if (!registrationRequest) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 })
    }

    if (registrationRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Заявка уже обработана' }, { status: 400 })
    }

    // Проверяем, не существует ли уже пользователь
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: registrationRequest.email },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 })
    }

    // Генерируем пароль, если не указан
    const password = data.password || Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(password, 10)

    // Формируем полный класс
    let fullClass = null
    if (data.class && data.classLetter) {
      fullClass = `${data.class}${data.classLetter}`
    } else if (data.class) {
      fullClass = data.class
    } else if (registrationRequest.class && registrationRequest.classLetter) {
      fullClass = `${registrationRequest.class}${registrationRequest.classLetter}`
    } else if (registrationRequest.class) {
      fullClass = registrationRequest.class
    }

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email: registrationRequest.email,
        name: registrationRequest.fullName,
        password: hashedPassword,
        role: data.role,
        class: data.class || registrationRequest.class || null,
        classLetter: data.classLetter || registrationRequest.classLetter || null,
        fullClass: fullClass,
      },
    })

    // Если роль MEMBER или MINISTER, создаем запись в ParliamentMember
    if (data.role === 'MEMBER' || data.role === 'MINISTER') {
      if (!data.ministry) {
        return NextResponse.json({ 
          error: 'Для участников парламента необходимо указать министерство' 
        }, { status: 400 })
      }

      await prisma.parliamentMember.create({
        data: {
          userId: user.id,
          ministry: data.ministry,
          position: data.role === 'MINISTER' ? 'Министр' : 'Участник',
        },
      })
    }

    // Обновляем заявку (проверка на существование уже выполнена выше)
    await prisma.registrationRequest.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      password: password, // Возвращаем пароль для отправки пользователю
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    // Обработка ошибок Prisma
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 })
    }
    console.error('Ошибка при одобрении заявки:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// DELETE - отклонить заявку
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const { feedback } = body

    // Проверяем, что заявка существует
    const existingRequest = await prisma.registrationRequest.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 })
    }

    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Заявка уже обработана' }, { status: 400 })
    }

    await prisma.registrationRequest.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        feedback: feedback || 'Заявка отклонена',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    // Обработка ошибок Prisma
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 })
    }
    console.error('Ошибка при отклонении заявки:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

