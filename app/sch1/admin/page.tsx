import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  Target, 
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  // Загружаем статистику
  const stats = {
    totalUsers: await prisma.user.count(),
    totalMembers: await prisma.parliamentMember.count({ where: { isActive: true } }),
    totalTasks: await prisma.task.count(),
    pendingTasks: await prisma.task.count({ where: { status: 'NEW' } }),
    inProgressTasks: await prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    completedTasks: await prisma.task.count({ where: { status: 'COMPLETED' } }),
    pendingReports: await prisma.taskReport.count({ where: { status: 'PENDING' } }),
    totalXP: await prisma.parliamentMember.aggregate({
      _sum: { xp: true },
    }),
  }

  // Последние задачи
  const recentTasks = await prisma.task.findMany({
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
  })

  // Последние отчеты на проверке
  const pendingReports = await prisma.taskReport.findMany({
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
  })

  // Топ участники
  const topMembers = await prisma.parliamentMember.findMany({
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
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Шапка */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Админ-панель</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/sch1/dashboard"
                className="flex items-center text-gray-600 hover:text-primary-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
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
            <div className="space-y-3">
              {pendingReports.length > 0 ? (
                pendingReports.map((report) => (
                  <div key={report.id} className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-1">{report.task.title}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      От: {report.user.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {report.description.substring(0, 100)}...
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Награда: {report.task.xpReward} XP
                      </span>
                      <Link
                        href={`/sch1/reports/${report.id}`}
                        className="text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
                      >
                        Проверить
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Нет отчетов на проверке</p>
                </div>
              )}
            </div>
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
  )
}

