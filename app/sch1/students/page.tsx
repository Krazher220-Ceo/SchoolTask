import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Image, FileText, Award } from 'lucide-react'

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  // Получаем задачи для учеников (только STUDENT и PUBLIC с ministry=null или ministry='STUDENTS')
  const taskWhere: any = {
    OR: [
      { targetAudience: 'STUDENT' },
      {
        targetAudience: 'PUBLIC',
        ministry: null, // Общественные задачи без министерства (для всех)
      },
      {
        targetAudience: 'PUBLIC',
        ministry: 'STUDENTS', // Общественные задачи специально для учеников
      },
    ],
  }

  // Админы видят все задачи
  if (session.user.role === 'ADMIN') {
    taskWhere.OR.push({ targetAudience: 'PUBLIC' })
  }

  const studentTasks = await prisma.task.findMany({
    where: taskWhere,
    include: {
      publicTaskInstances: {
        where: {
          userId: session.user.id,
        },
        take: 1,
      },
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Получаем отчеты ученика (если не админ, то только свои)
  const whereReports: any = {}
  if (session.user.role !== 'ADMIN') {
    whereReports.userId = session.user.id
  }

  const reports = await prisma.studentReport.findMany({
    where: whereReports,
    include: {
      user: {
        select: {
          name: true,
          class: true,
        },
      },
      task: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  // Получаем общий EP пользователя
  const totalEP = session.user.role === 'ADMIN' 
    ? null 
    : await prisma.eventPoint.aggregate({
        where: { userId: session.user.id },
        _sum: { amount: true },
      })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              ← Назад
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/sch1/students"
                className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold"
              >
                Задачи
              </Link>
              <Link
                href="/sch1/students/quests"
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
              >
                Мои задания
              </Link>
            </div>
            {session.user.role === 'ADMIN' && (
              <Link
                href="/sch1/tasks/new?target=student"
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
        {/* Статистика EP (для учеников) */}
        {session.user.role !== 'ADMIN' && totalEP && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ваши баллы (EP)</h2>
                <div className="text-4xl font-bold text-primary-600">
                  {totalEP._sum.amount || 0} EP
                </div>
              </div>
              <Award className="h-16 w-16 text-primary-600" />
            </div>
          </div>
        )}

        {/* Задачи для учеников */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Доступные задачи</h2>
          <div className="space-y-4">
            {studentTasks.length > 0 ? (
              studentTasks.map((task: any) => (
                <div key={task.id} className="border-2 border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                        {task.taskType === 'PUBLIC' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            Общественная
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Награда: {task.epReward} EP</span>
                        {task.deadline && (
                          <span>До: {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
                        )}
                        {task.taskType === 'PUBLIC' && task.publicTaskInstances && task.publicTaskInstances.length > 0 && (
                          <span className="text-green-600">✓ Взята</span>
                        )}
                      </div>
                    </div>
                    {session.user.role !== 'ADMIN' && (
                      <Link
                        href={task.taskType === 'PUBLIC' ? `/sch1/public-tasks/${task.id}` : `/sch1/students/tasks/${task.id}/report`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                      >
                        {task.taskType === 'PUBLIC' ? (task.publicTaskInstances && task.publicTaskInstances.length > 0 ? 'Продолжить' : 'Взять') : 'Выполнить'}
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Задач для учеников пока нет</p>
            )}
          </div>
        </div>

        {/* Отчеты */}
        {session.user.role === 'ADMIN' ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Отчеты учеников на проверке</h2>
            {reports.filter(r => r.status === 'PENDING').length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ученик</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Класс</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Тип</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Предмет</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Балл</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">EP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Фото</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Дата</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports
                      .filter(r => r.status === 'PENDING')
                      .map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{report.user.name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {report.user.class || '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              report.type === 'GRADE_PHOTO' ? 'bg-blue-100 text-blue-700' :
                              report.type === 'SOR' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {report.type === 'GRADE_PHOTO' ? 'Балл' :
                               report.type === 'SOR' ? 'СОР' : 'Задача'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {report.subject || '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {report.grade || '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-semibold">
                            {report.epAmount || 0} EP
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {report.photoUrl ? (
                              <a
                                href={report.photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Просмотр
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex gap-2">
                              <Link
                                href={`/sch1/students/reports/${report.id}/approve`}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                              >
                                Одобрить
                              </Link>
                              <Link
                                href={`/sch1/students/reports/${report.id}/reject`}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                              >
                                Отклонить
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Нет отчетов на проверке</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Мои отчеты</h2>
            {reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Тип</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Предмет</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Балл</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">EP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Статус</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Фото</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Дата</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Комментарий</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            report.type === 'GRADE_PHOTO' ? 'bg-blue-100 text-blue-700' :
                            report.type === 'SOR' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {report.type === 'GRADE_PHOTO' ? 'Балл' :
                             report.type === 'SOR' ? 'СОР' : 'Задача'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {report.subject || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {report.grade || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {report.epAmount && report.status === 'APPROVED' ? (
                            <span className="text-green-600 font-semibold">+{report.epAmount} EP</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            report.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            report.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {report.status === 'APPROVED' ? 'Одобрено' :
                             report.status === 'REJECTED' ? 'Отклонено' : 'На проверке'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {report.photoUrl ? (
                            <a
                              href={report.photoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Просмотр
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                          {report.feedback ? (
                            <div className="bg-gray-50 border-l-4 border-gray-400 p-2 rounded">
                              <p className="text-xs">{report.feedback}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">У вас пока нет отчетов</p>
                <Link
                  href="/sch1/students/report"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition inline-flex items-center"
                >
                  <Image className="h-5 w-5 mr-2" aria-label="Иконка изображения" />
                  Загрузить фото балла
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

