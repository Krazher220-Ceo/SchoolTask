import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE - удалить все задачи (только для ADMIN)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Только ADMIN может удалять все задачи
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    // Удаляем все связанные данные
    await prisma.taskReport.deleteMany({})
    await prisma.studentReport.deleteMany({})
    await prisma.publicTaskInstance.deleteMany({})
    
    // Удаляем все задачи
    const deletedCount = await prisma.task.deleteMany({})

    // Уведомляем админа
    try {
      const { notifyAdminAboutAction } = await import('@/telegram/bot')
      await notifyAdminAboutAction(
        'Удалены все задачи',
        `Все задачи (${deletedCount.count}) удалены пользователем ${session.user.name}`,
        { deletedCount: deletedCount.count }
      )
    } catch (error) {
      console.error('Ошибка отправки уведомления админу:', error)
    }

    return NextResponse.json({ 
      message: `Удалено задач: ${deletedCount.count}`,
      count: deletedCount.count 
    })
  } catch (error) {
    console.error('Ошибка при удалении всех задач:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

