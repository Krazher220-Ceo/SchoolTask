import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Award, FileText, CheckCircle, XCircle } from 'lucide-react'
import { ministryNames } from '@/lib/utils'
import TaskActions from './TaskActions'

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          parliamentMember: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      reports: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!task) {
    redirect('/sch1/tasks')
  }

  // Проверка прав доступа
  const canView = 
    session.user.role === 'ADMIN' ||
    task.createdById === session.user.id ||
    task.assignedToId === session.user.id ||
    (session.user.parliamentMember && task.ministry === session.user.parliamentMember.ministry)

  if (!canView) {
    redirect('/sch1/tasks')
  }

  const canEdit = session.user.role === 'ADMIN' || task.createdById === session.user.id
  const canReport = task.assignedToId === session.user.id && task.status !== 'COMPLETED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/tasks" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Задача</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h2>
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  task.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                  task.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.status === 'COMPLETED' ? 'Выполнено' :
                   task.status === 'IN_PROGRESS' ? 'В работе' :
                   task.status === 'IN_REVIEW' ? 'На проверке' :
                   task.status === 'REJECTED' ? 'Отклонено' : 'Новая'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  task.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                  task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.priority === 'CRITICAL' ? 'Критический' :
                   task.priority === 'HIGH' ? 'Высокий' :
                   task.priority === 'MEDIUM' ? 'Средний' : 'Низкий'}
                </span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Министерство: {task.ministry ? ministryNames[task.ministry] : 'Не указано'}</span>
            </div>
            {task.assignedTo && (
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-2" />
                <span>Исполнитель: {task.assignedTo.name}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <Award className="h-5 w-5 mr-2" />
              <span>Награда: {task.xpReward} XP</span>
            </div>
            {task.deadline && (
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Дедлайн: {new Date(task.deadline).toLocaleString('ru-RU')}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <User className="h-5 w-5 mr-2" />
              <span>Создал: {task.createdBy.name}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Создано: {new Date(task.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>

          {canEdit && (
            <TaskActions task={task} />
          )}
        </div>

        {/* Отчеты */}
        {task.reports.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Отчеты</h3>
            <div className="space-y-4">
              {task.reports.map((report) => (
                <div key={report.id} className="border-2 border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold text-gray-900">{report.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      report.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      report.status === 'NEEDS_REVISION' ? 'bg-yellow-100 text-yellow-700' :
                      report.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.status === 'APPROVED' ? 'Одобрен' :
                       report.status === 'NEEDS_REVISION' ? 'Требует доработки' :
                       report.status === 'REJECTED' ? 'Отклонен' : 'На проверке'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{report.description}</p>
                  {report.feedback && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                      <p className="text-sm text-gray-700">{report.feedback}</p>
                    </div>
                  )}
                  {report.status === 'PENDING' && (session.user.role === 'ADMIN' || session.user.role === 'MINISTER') && (
                    <div className="flex space-x-2">
                      <Link
                        href={`/sch1/reports/${report.id}/approve`}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        Одобрить
                      </Link>
                      <Link
                        href={`/sch1/reports/${report.id}/reject`}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Отклонить
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Форма отчета */}
        {canReport && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Отправить отчет</h3>
            <Link
              href={`/sch1/tasks/${task.id}/report`}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition inline-flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              Создать отчет
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

