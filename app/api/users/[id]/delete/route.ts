import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE - удалить пользователя
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может удалять пользователей
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    // Нельзя удалить самого себя
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Нельзя удалить самого себя' }, { status: 400 })
    }

    // Проверяем, что пользователь существует
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Удаляем пользователя (каскадное удаление обработается Prisma)
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Пользователь удален' })
  } catch (error: any) {
    // Обработка ошибок Prisma
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }
    console.error('Ошибка при удалении пользователя:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

