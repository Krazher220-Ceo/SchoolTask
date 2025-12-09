import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить инстанс общественной задачи для текущего пользователя
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const instance = await prisma.publicTaskInstance.findFirst({
      where: {
        taskId: params.id,
        userId: session.user.id,
      },
    })

    // Если инстанс не найден, возвращаем null вместо 404 (это нормальная ситуация)
    if (!instance) {
      return NextResponse.json({ instance: null }, { status: 200 })
    }

    return NextResponse.json(instance)
  } catch (error) {
    console.error('Ошибка при получении инстанса:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

