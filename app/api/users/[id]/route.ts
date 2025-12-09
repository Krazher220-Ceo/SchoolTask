import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'MINISTER', 'MEMBER', 'STUDENT']).optional(),
  telegramId: z.string().nullable().optional(),
  telegramUsername: z.string().nullable().optional(),
  parliamentMember: z.object({
    ministry: z.string().optional(),
    position: z.string().nullable().optional(),
    shift: z.string().nullable().optional(),
  }).nullable().optional(),
})

// PATCH - обновить пользователя
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может изменять пользователей
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateUserSchema.parse(body)

    // Обновляем пользователя
    const updateData: any = {}
    if (data.role) {
      updateData.role = data.role
    }
    if (data.telegramId !== undefined) {
      updateData.telegramId = data.telegramId
    }
    if (data.telegramUsername !== undefined) {
      updateData.telegramUsername = data.telegramUsername
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        parliamentMember: true,
      },
    })

    // Обновляем или создаем/удаляем членство в парламенте
    if (data.parliamentMember !== undefined) {
      if (data.parliamentMember === null) {
        // Удаляем из парламента
        if (user.parliamentMember) {
          await prisma.parliamentMember.delete({
            where: { id: user.parliamentMember.id },
          })
        }
      } else {
        // Обновляем или создаем членство
        if (user.parliamentMember) {
          await prisma.parliamentMember.update({
            where: { id: user.parliamentMember.id },
            data: {
              ministry: data.parliamentMember.ministry || user.parliamentMember.ministry,
              position: data.parliamentMember.position !== undefined 
                ? data.parliamentMember.position 
                : user.parliamentMember.position,
              shift: data.parliamentMember.shift !== undefined 
                ? data.parliamentMember.shift 
                : user.parliamentMember.shift,
            },
          })
        } else if (data.parliamentMember.ministry) {
          // Создаем новое членство
          await prisma.parliamentMember.create({
            data: {
              userId: params.id,
              ministry: data.parliamentMember.ministry,
              position: data.parliamentMember.position || null,
              shift: data.parliamentMember.shift || null,
              xp: 0,
              level: 1,
              rank: 'Новичок',
            },
          })
        }
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        parliamentMember: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка при обновлении пользователя:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

