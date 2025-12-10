import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminSidebar from '@/app/components/AdminSidebar'
import { ArrowLeft, Check, X, Clock } from 'lucide-react'
import PublicTasksClient from './PublicTasksClient'

export default async function PublicTasksAdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  // Получаем задачи с топ рейтингом
  const tasksWithTop = await prisma.task.findMany({
    where: {
      taskType: 'PUBLIC',
      topRanking: { not: null },
    },
    select: {
      id: true,
      title: true,
      topRanking: true,
      deadline: true,
      epReward: true,
      selectedTopInstances: true,
      topAwarded: true,
    },
  })

  const instances = await prisma.publicTaskInstance.findMany({
    where: {
      status: 'IN_REVIEW',
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          description: true,
          epReward: true,
          topRanking: true,
          deadline: true,
          selectedTopInstances: true,
          topAwarded: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          class: true,
        },
      },
      reviewer: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/sch1/admin" className="flex items-center text-gray-700 hover:text-primary-600">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Назад
              </Link>
              <h1 className="text-xl font-bold text-gray-900 ml-4">Общественные задачи на проверке</h1>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Задачи с топ рейтингом */}
          {tasksWithTop.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Задачи с топ рейтингом</h2>
              <div className="space-y-4">
                {tasksWithTop.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        Топ {task.topRanking}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      <p>EP награда: {task.epReward}</p>
                      {task.deadline && (
                        <p>Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}</p>
                      )}
                      {task.deadline && new Date(task.deadline) < new Date() && !task.topAwarded && (
                        <p className="text-red-600 font-semibold">Дедлайн прошел - можно начислить баллы</p>
                      )}
                      {task.topAwarded && (
                        <p className="text-green-600 font-semibold">Баллы уже начислены</p>
                      )}
                    </div>
                    <Link
                      href={`/sch1/admin/public-tasks/${task.id}/select-top`}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition inline-block"
                    >
                      Управление топом
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PublicTasksClient instances={instances} />
        </div>
      </div>
    </div>
  )
}

