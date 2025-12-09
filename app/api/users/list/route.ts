import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить список пользователей для выбора исполнителя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Получаем всех активных членов парламента
    const users = await prisma.user.findMany({
      where: {
        parliamentMember: {
          isActive: true,
        },
      },
      include: {
        parliamentMember: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        parliamentMember: u.parliamentMember ? {
          ministry: u.parliamentMember.ministry,
          position: u.parliamentMember.position,
        } : null,
      })),
      role: session.user.role,
      ministry: session.user.parliamentMember?.ministry || null,
    })
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

