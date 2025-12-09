import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

const registrationSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  login: z.string().min(3),
  bilimClassLogin: z.string().optional().nullable(),
  class: z.string().optional().nullable(), // Класс (например "9")
  classLetter: z.string().optional().nullable(), // Литер (например "Д", без кавычек)
})

// POST - создать заявку на регистрацию
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registrationSchema.parse(body)

    // Проверяем, не существует ли уже пользователь с таким email или login
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { email: data.login + '@school.local' }, // Проверяем, если login используется как email
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Пользователь с таким email или логином уже существует' 
      }, { status: 400 })
    }

    // Проверяем, не существует ли уже заявка с таким email или login
    const existingRequest = await prisma.registrationRequest.findFirst({
      where: {
        OR: [
          { email: data.email },
          { login: data.login },
        ],
        status: 'PENDING',
      },
    })

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'Заявка с таким email или логином уже подана и ожидает рассмотрения' 
      }, { status: 400 })
    }

    // Если указан Bilim class login, используем его как логин (если логин не был изменен)
    let finalLogin = data.login
    if (data.bilimClassLogin && data.bilimClassLogin === data.login) {
      finalLogin = data.bilimClassLogin
    }

    // Создаем заявку
    const registrationRequest = await prisma.registrationRequest.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        login: finalLogin,
        bilimClassLogin: data.bilimClassLogin,
        class: data.class || null,
        classLetter: data.classLetter || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Заявка успешно подана. Ожидайте рассмотрения администратором.',
      id: registrationRequest.id,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при создании заявки:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// GET - получить заявки (только для админа)
export async function GET(req: NextRequest) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status

    const registrationRequests = await prisma.registrationRequest.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(registrationRequests)
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

