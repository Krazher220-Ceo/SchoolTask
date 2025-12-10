import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - получить всю статистику админ панели в одном запросе
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    // Загружаем всю статистику параллельно
    const [
      totalUsers,
      totalMembers,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      pendingReports,
      totalXP,
      recentTasks,
      pendingReportsList,
      topMembers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.parliamentMember.count({ where: { isActive: true } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'NEW' } }),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.taskReport.count({ where: { status: 'PENDING' } }),
      prisma.parliamentMember.aggregate({
        _sum: { xp: true },
      }),
      prisma.task.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: { name: true },
          },
          createdBy: {
            select: { name: true },
          },
        },
      }),
      prisma.taskReport.findMany({
        where: { status: 'PENDING' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          task: {
            select: {
              title: true,
              xpReward: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.parliamentMember.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { xp: 'desc' },
        take: 10,
      }),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalMembers,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        pendingReports,
        totalXP: totalXP._sum.xp || 0,
      },
      recentTasks,
      pendingReportsList,
      topMembers,
    })
  } catch (error) {
    console.error('Ошибка при получении статистики:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

