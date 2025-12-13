import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - присоединиться к гильдии
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const guild = await prisma.guild.findUnique({
      where: { id: params.id },
    })

    if (!guild || !guild.isActive) {
      return NextResponse.json({ error: 'Гильдия не найдена' }, { status: 404 })
    }

    // Проверяем, не состоит ли уже в гильдии
    const existingMember = await prisma.guildMember.findFirst({
      where: { userId: session.user.id },
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Ты уже состоишь в гильдии' }, { status: 400 })
    }

    // Добавляем участника
    await prisma.guildMember.create({
      data: {
        guildId: params.id,
        userId: session.user.id,
        role: 'MEMBER',
      },
    })

    return NextResponse.json({ success: true, message: 'Ты присоединился к гильдии!' })
  } catch (error) {
    console.error('Ошибка присоединения к гильдии:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

