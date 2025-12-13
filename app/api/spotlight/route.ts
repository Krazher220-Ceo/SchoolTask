import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить текущий Spotlight
export async function GET(request: NextRequest) {
  try {
    const spotlight = await prisma.spotlight.findFirst({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            class: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!spotlight) {
      return NextResponse.json(null)
    }

    return NextResponse.json(spotlight)
  } catch (error) {
    console.error('Ошибка при получении Spotlight:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

