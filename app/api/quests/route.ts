import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllQuestsForUser } from '@/lib/quests'

export const dynamic = 'force-dynamic'

// GET - получить все задания для текущего пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Получаем задания для пользователя
    const quests = await getAllQuestsForUser(session.user.id)

    return NextResponse.json({
      daily: quests.daily,
      weekly: quests.weekly,
      monthly: quests.monthly,
    })
  } catch (error) {
    console.error('Ошибка при получении заданий:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заданий' },
      { status: 500 }
    )
  }
}

