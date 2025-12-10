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

  // Загружаем данные параллельно для оптимизации
  const [publicTaskInstances, myTasks, allMyTasks] = await Promise.all([
    session.user.role !== 'ADMIN' 
      ? prisma.publicTaskInstance.findMany({
          where: { userId: session.user.id },
          include: { task: true },
        })
      : Promise.resolve([]),
    prisma.task.findMany({
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
    }),
    prisma.task.findMany({
      where: taskWhere,
    }),
  ])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 selection:bg-[#0ea5e9] selection:text-white">
      {/* Шапка */}
      <header className="glass-nav border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white font-semibold tracking-tighter shadow-sm shadow-blue-200">
                СП
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">Личный кабинет</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/sch1"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Главная
              </Link>
              <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
              <Link
                href="/api/auth/signout"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Выйти
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-2">
                Привет, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {member 
                  ? `Министерство ${member.ministry === 'LAW_AND_ORDER' ? 'Права и порядка' : 
                             member.ministry === 'INFORMATION' ? 'Информации' :
                             member.ministry === 'SPORT' ? 'Спорта' : 'Заботы'} • ${member.position || 'Участник'}`
                  : 'Ученик школы'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/60 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <Calendar className="h-4 w-4" />
              <span>Сегодня</span>
            </div>
          </div>
        </section>

        {/* Прогресс уровня */}
        {member && (
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-semibold text-gray-900">Уровень {level}</h2>
                  <span className="text-xs font-semibold text-[#0284c7] bg-blue-50 px-2 py-0.5 rounded-full">{rank}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold text-[#0284c7] tracking-tight">{member.xp} XP</div>
                <div className="text-xs text-gray-500">До следующего уровня: {nextLevelXP - member.xp} XP</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#0ea5e9] to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </section>
        )}

        {/* Статистика */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Всего задач</p>
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{stats.total}</h3>
              </div>
              <div className="p-3 bg-blue-100 text-[#0284c7] rounded-lg">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Выполнено</p>
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{stats.completed}</h3>
              </div>
              <div className="p-3 bg-green-100 text-[#10b981] rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">В работе</p>
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{stats.inProgress}</h3>
              </div>
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Ожидают</p>
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{stats.pending}</h3>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Мои задачи */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Мои задачи</h2>
              <Link 
                href={session.user.role === 'STUDENT' ? '/sch1/students' : '/sch1/tasks'} 
                className="text-sm font-medium text-[#0284c7] hover:text-[#0369a1] flex items-center gap-1"
              >
                Все задачи
                <ArrowRight className="h-4 w-4" />
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
                      className="group block border border-gray-200 rounded-lg p-4 hover:bg-blue-50/30 hover:border-[#0284c7]/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-4">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#0284c7] transition-colors">{task.title}</h4>
                          {task.taskType === 'PUBLIC' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Общественная
                            </span>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                          taskStatus === 'COMPLETED' ? 'bg-[#dcfce7] text-[#10b981] border border-[#86efac]/30' :
                          taskStatus === 'IN_PROGRESS' || taskStatus === 'IN_REVIEW' ? 'bg-[#fef3c7] text-[#f59e0b] border border-[#fcd34d]/30' :
                          taskStatus === 'REJECTED' ? 'bg-[#fee2e2] text-[#ef4444] border border-[#fca5a5]/30' :
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {taskStatus === 'IN_PROGRESS' && <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse"></span>}
                          {taskStatus === 'COMPLETED' && <CheckCircle className="h-3 w-3" />}
                          {taskStatus === 'COMPLETED' ? 'Выполнено' :
                           taskStatus === 'IN_PROGRESS' ? 'В работе' :
                           taskStatus === 'IN_REVIEW' ? 'На проверке' :
                           taskStatus === 'REJECTED' ? 'Отклонено' : 'Новая'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-2">
                        {task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {task.targetAudience === 'STUDENT' || task.targetAudience === 'PUBLIC' 
                            ? `${task.epReward || 0} EP`
                            : `${task.xpReward || 0} XP`}
                        </span>
                        {task.deadline && (
                          <span>{new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
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
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Последние начисления XP</h2>
            <div className="space-y-3">
              {user.xpHistory.length > 0 ? (
                user.xpHistory.map((xp) => (
                  <div key={xp.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{xp.reason}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(xp.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <div className="text-[#0284c7] font-semibold text-sm">+{xp.amount} XP</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">История пуста</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Быстрые действия */}
        <section className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Быстрые действия</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {session.user.role === 'ADMIN' && (
              <>
                <Link
                  href="/sch1/admin"
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-2.5 rounded-lg transition font-medium text-center text-sm shadow-sm shadow-blue-200"
                >
                  Админ-панель
                </Link>
                <Link
                  href="/sch1/tasks/new"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg transition font-medium text-center text-sm shadow-sm"
                >
                  Создать задачу
                </Link>
                <Link
                  href="/sch1/ratings"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg transition font-medium text-center text-sm shadow-sm"
                >
                  Рейтинги
                </Link>
              </>
            )}
            <Link
              href="/sch1/telegram-link"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition font-medium text-center flex items-center justify-center text-sm shadow-sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Привязать Telegram
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

