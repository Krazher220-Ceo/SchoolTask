import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить все завершенные инстансы задачи для выбора топа
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const instances = await prisma.publicTaskInstance.findMany({
      where: {
        taskId: params.id,
        status: 'COMPLETED', // Только завершенные задачи
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            fullClass: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // Сначала последние
      },
    })

    return NextResponse.json({ instances })
  } catch (error) {
    console.error('Ошибка при получении инстансов:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

