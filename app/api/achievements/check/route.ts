import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkAchievements } from '@/lib/achievements'

export const dynamic = 'force-dynamic'

// POST - проверить и разблокировать достижения
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const unlocked = await checkAchievements(session.user.id)

    return NextResponse.json({
      unlocked,
      count: unlocked.length,
    })
  } catch (error) {
    console.error('Ошибка проверки достижений:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

