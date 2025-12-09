import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLevelFromXP } from '@/lib/utils'
import Link from 'next/link'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  Award,
  Users,
  ArrowRight,
  MessageCircle
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      parliamentMember: true,
      taskReports: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        include: {
          task: {
            select: {
              title: true,
            },
          },
        },
      },
      xpHistory: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  })

  if (!user) {
    redirect('/sch1/login')
  }

  const member = user.parliamentMember
  const { level, rank, nextLevelXP } = member 
    ? getLevelFromXP(member.xp)
    : { level: 1, rank: 'Новичок', nextLevelXP: 100 }

  const progress = member ? ((member.xp / nextLevelXP) * 100) : 0

  // Статистика задач - получаем все доступные задачи
  const taskWhere: any = {}
  
  if (session.user.role === 'STUDENT') {
    // Обычные ученики видят только задачи для учеников и общественные
    taskWhere.OR = [
      { targetAudience: 'STUDENT' },
      { targetAudience: 'PUBLIC' },
    ]
  } else if (session.user.parliamentMember) {
    // Участники парламента видят свои задачи, задачи министерства, задачи для учеников и общественные
    taskWhere.OR = [
      { assignedToId: session.user.id },
      { ministry: session.user.parliamentMember.ministry },
      { targetAudience: 'STUDENT' },
      { targetAudience: 'PUBLIC' },
    ]
  } else {
    // Для других ролей показываем только назначенные задачи
    taskWhere.assignedToId = session.user.id
  }

  // Получаем общественные задачи, которые пользователь взял (для статистики)
  const publicTaskInstances = session.user.role !== 'ADMIN' 
    ? await prisma.publicTaskInstance.findMany({
        where: { userId: session.user.id },
        include: { task: true },
      })
    : []

  const myTasks = await prisma.task.findMany({
    where: taskWhere,
    include: {
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
    take: 5,
  })

  // Применяем приоритет для участников парламента
  if (session.user.parliamentMember) {
    const userMinistry = session.user.parliamentMember.ministry
    myTasks.sort((a, b) => {
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

  const allMyTasks = await prisma.task.findMany({
    where: taskWhere,
  })

  // Для статистики учитываем также общественные задачи, которые пользователь взял
  // Убираем дубликаты (если задача уже есть в allMyTasks, не добавляем её из publicTaskInstances)
  const publicTasksTaken = publicTaskInstances
    .filter(inst => !allMyTasks.some(task => task.id === inst.taskId))
    .map(inst => inst.task)

  const allTasksForStats = [...allMyTasks, ...publicTasksTaken]

  const stats = {
    total: allTasksForStats.length,
    completed: allTasksForStats.filter(t => {
      if (t.taskType === 'PUBLIC') {
        const instance = publicTaskInstances.find(inst => inst.taskId === t.id)
        return instance?.status === 'COMPLETED'
      }
      return t.status === 'COMPLETED'
    }).length,
    inProgress: allTasksForStats.filter(t => {
      if (t.taskType === 'PUBLIC') {
        const instance = publicTaskInstances.find(inst => inst.taskId === t.id)
        return instance?.status === 'IN_PROGRESS' || instance?.status === 'IN_REVIEW'
      }
      return t.status === 'IN_PROGRESS'
    }).length,
    pending: allTasksForStats.filter(t => {
      if (t.taskType === 'PUBLIC') {
        const instance = publicTaskInstances.find(inst => inst.taskId === t.id)
        return instance?.status === 'NEW' || instance?.status === 'IN_REVIEW'
      }
      return t.status === 'NEW' || t.status === 'IN_REVIEW'
    }).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Шапка */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Личный кабинет</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              <Link
                href="/api/auth/signout"
                className="text-gray-600 hover:text-primary-600 transition"
              >
                Выйти
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Приветствие */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {user.name}!
          </h1>
          <p className="text-gray-600">
            {member 
              ? `Министерство ${member.ministry === 'LAW_AND_ORDER' ? 'Права и порядка' : 
                         member.ministry === 'INFORMATION' ? 'Информации' :
                         member.ministry === 'SPORT' ? 'Спорта' : 'Заботы'} • ${member.position || 'Участник'}`
              : 'Ученик школы'}
          </p>
        </section>

        {/* Прогресс уровня */}
        {member && (
          <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Уровень {level}</h2>
                <p className="text-gray-600">{rank}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">{member.xp} XP</div>
                <div className="text-sm text-gray-500">До следующего уровня: {nextLevelXP - member.xp} XP</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-primary-500 to-indigo-500 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </section>
        )}

        {/* Статистика */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Target className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Всего задач</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
            <div className="text-sm text-gray-600">Выполнено</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">В работе</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-sm text-gray-600">Ожидают</div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Мои задачи */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Мои задачи</h2>
              <Link href="/sch1/tasks" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                Все задачи
                <ArrowRight className="inline h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {myTasks.length > 0 ? (
                myTasks.map((task: any) => {
                  // Определяем ссылку в зависимости от типа задачи
                  const taskLink = task.taskType === 'PUBLIC' 
                    ? `/sch1/public-tasks/${task.id}`
                    : task.targetAudience === 'STUDENT' || task.targetAudience === 'PUBLIC'
                    ? `/sch1/students`
                    : `/sch1/tasks/${task.id}`
                  
                  // Определяем статус для общественных задач
                  const taskStatus = task.taskType === 'PUBLIC' && task.publicTaskInstances?.length > 0
                    ? task.publicTaskInstances[0].status
                    : task.status
                  
                  return (
                    <Link
                      key={task.id}
                      href={taskLink}
                      className="block border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{task.title}</div>
                          {task.taskType === 'PUBLIC' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                              Общественная
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          taskStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          taskStatus === 'IN_PROGRESS' || taskStatus === 'IN_REVIEW' ? 'bg-blue-100 text-blue-700' :
                          taskStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {taskStatus === 'COMPLETED' ? 'Выполнено' :
                           taskStatus === 'IN_PROGRESS' ? 'В работе' :
                           taskStatus === 'IN_REVIEW' ? 'На проверке' :
                           taskStatus === 'REJECTED' ? 'Отклонено' : 'Новая'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {task.targetAudience === 'STUDENT' || task.targetAudience === 'PUBLIC' 
                            ? `Награда: ${task.epReward || 0} EP`
                            : `Награда: ${task.xpReward || 0} XP`}
                        </span>
                        {task.deadline && (
                          <span>До: {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
                        )}
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>У вас пока нет задач</p>
                </div>
              )}
            </div>
          </section>

          {/* История XP */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Последние начисления XP</h2>
            <div className="space-y-3">
              {user.xpHistory.length > 0 ? (
                user.xpHistory.map((xp) => (
                  <div key={xp.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{xp.reason}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(xp.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <div className="text-primary-600 font-bold">+{xp.amount} XP</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>История пуста</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Быстрые действия */}
        <section className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Быстрые действия</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {session.user.role === 'ADMIN' && (
              <>
                <Link
                  href="/sch1/admin"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold text-center"
                >
                  Админ-панель
                </Link>
                <Link
                  href="/sch1/tasks/new"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold text-center"
                >
                  Создать задачу
                </Link>
                <Link
                  href="/sch1/ratings"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold text-center"
                >
                  Рейтинги
                </Link>
              </>
            )}
            <Link
              href="/sch1/telegram-link"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold text-center flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Привязать Telegram
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

