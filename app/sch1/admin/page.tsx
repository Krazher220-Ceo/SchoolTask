import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminSidebar from '@/app/components/AdminSidebar'
import { 
  Shield, 
  Users, 
  Target, 
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  MessageCircle
} from 'lucide-react'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  // Загружаем всю статистику параллельно для оптимизации
  const [
    statsData,
    recentTasks,
    pendingReports,
    topMembers,
  ] = await Promise.all([
    Promise.all([
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
    ]),
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

  const stats = {
    totalUsers: statsData[0],
    totalMembers: statsData[1],
    totalTasks: statsData[2],
    pendingTasks: statsData[3],
    inProgressTasks: statsData[4],
    completedTasks: statsData[5],
    pendingReports: statsData[6],
    totalXP: statsData[7]._sum.xp || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        {/* Шапка */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-primary-600" />
                <h1 className="text-xl font-bold text-gray-900">Главная</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/sch1/dashboard"
                  className="flex items-center text-gray-600 hover:text-primary-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад в дашборд
                </Link>
                <span className="text-gray-700">{session.user.name}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Общая статистика</h2>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Users className="h-8 w-8 text-blue-600 mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Всего пользователей</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Award className="h-8 w-8 text-purple-600 mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
            <div className="text-sm text-gray-600">Членов парламента</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Target className="h-8 w-8 text-green-600 mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
            <div className="text-sm text-gray-600">Всего задач</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <TrendingUp className="h-8 w-8 text-orange-600 mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalXP._sum.xp || 0}</div>
            <div className="text-sm text-gray-600">Всего XP</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Clock className="h-8 w-8 text-yellow-600 mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</div>
            <div className="text-sm text-gray-600">Новых задач</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <AlertCircle className="h-8 w-8 text-blue-600 mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.inProgressTasks}</div>
            <div className="text-sm text-gray-600">В работе</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <CheckCircle className="h-8 w-8 text-green-600 mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.completedTasks}</div>
            <div className="text-sm text-gray-600">Выполнено</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Последние задачи */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Последние задачи</h3>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-gray-900">{task.title}</div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Исполнитель: {task.assignedTo?.name || 'Не назначен'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Создал: {task.createdBy.name} • {task.xpReward} XP
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/sch1/tasks"
              className="mt-4 block text-center text-primary-600 hover:text-primary-700 font-semibold"
            >
              Все задачи →
            </Link>
          </section>

          {/* Отчеты на проверке */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Отчеты на проверке ({stats.pendingReports})
            </h3>
            {pendingReports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Задача</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Исполнитель</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Описание</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Награда</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Дата</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{report.task.title}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {report.user.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                          <p className="truncate">{report.description}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {report.task.xpReward} XP
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link
                            href={`/sch1/reports/${report.id}`}
                            className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition"
                          >
                            Проверить
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Нет отчетов на проверке</p>
              </div>
            )}
          </section>
        </div>

        {/* Топ участники */}
        <section className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Топ-10 участников по XP</h3>
          <div className="space-y-3">
            {topMembers.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-primary-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{member.user.name}</div>
                    <div className="text-xs text-gray-500">{member.user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-600">{member.xp} XP</div>
                  <div className="text-xs text-gray-500">Уровень {member.level}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Быстрые действия */}
        <section className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Быстрые действия</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/sch1/tasks/new"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold text-center"
            >
              Создать задачу
            </Link>
            <Link
              href="/sch1/ratings"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold text-center"
            >
              Рейтинги
            </Link>
            <Link
              href="/sch1/admin/users"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold text-center"
            >
              Управление пользователями
            </Link>
            <Link
              href="/sch1/admin/registrations"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-center"
            >
              Заявки на регистрацию
            </Link>
        <Link
          href="/sch1/admin/public-tasks"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold text-center"
        >
          Общественные задачи
        </Link>
        <Link
          href="/sch1/admin/reports"
          className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition font-semibold text-center"
        >
          Отчеты по паролям
        </Link>
        <Link
          href="/sch1/admin/events"
          className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold text-center"
        >
          Управление мероприятиями
        </Link>
        <Link
          href="/sch1/admin/stats"
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-semibold text-center"
        >
          Управление статистикой
        </Link>
        <Link
          href="/sch1/admin/telegram"
          className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition font-semibold text-center flex items-center justify-center"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Настройка Telegram
        </Link>
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}

