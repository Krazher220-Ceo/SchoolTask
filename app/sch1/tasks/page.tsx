import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import TasksClient from './TasksClient'

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { status?: string; ministry?: string; assignedToId?: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  const where: any = {}
  
  // Фильтры
  if (searchParams.status) {
    where.status = searchParams.status
  }
  if (searchParams.ministry) {
    where.ministry = searchParams.ministry
  }
  if (searchParams.assignedToId) {
    where.assignedToId = searchParams.assignedToId
  }

  // Если не админ, показываем свои задачи, задачи своего министерства, задачи для учеников и общественные
  if (session.user.role !== 'ADMIN') {
    if (session.user.parliamentMember) {
      where.OR = [
        { assignedToId: session.user.id },
        { ministry: session.user.parliamentMember.ministry },
        { targetAudience: 'STUDENT' },
        { targetAudience: 'PUBLIC' },
      ]
    } else {
      where.OR = [
        { assignedToId: session.user.id },
        { targetAudience: 'STUDENT' },
        { targetAudience: 'PUBLIC' },
      ]
    }
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      reports: {
        where: {
          status: 'PENDING',
        },
        take: 1,
      },
      publicTaskInstances: {
        where: {
          userId: session.user.id,
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Применяем приоритет для участников парламента
  if (session.user.parliamentMember) {
    const userMinistry = session.user.parliamentMember.ministry
    tasks.sort((a, b) => {
      // Приоритет по министерству
      const aIsMyMinistry = a.ministry === userMinistry ? 1 : 0
      const bIsMyMinistry = b.ministry === userMinistry ? 1 : 0
      if (aIsMyMinistry !== bIsMyMinistry) {
        return bIsMyMinistry - aIsMyMinistry
      }
      
      // Приоритет по важности
      const priorityOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  // Получаем список пользователей для фильтра
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

  const canCreate = session.user.role === 'ADMIN' || session.user.role === 'MINISTER'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              ← Назад
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Задачи</h1>
            {canCreate && (
              <Link
                href="/sch1/tasks/new"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать задачу
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TasksClient 
          tasks={tasks}
          users={users}
          initialFilters={searchParams}
        />
      </div>
    </div>
  )
}
