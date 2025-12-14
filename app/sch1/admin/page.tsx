import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminSidebar from '@/app/components/AdminSidebar'
import { unstable_cache } from 'next/cache'
import { 
  Users, 
  Target, 
  TrendingUp, 
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

// Компонент KPI Карточки
function KPICard({ title, value, total, change, trend, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {total && <span className="text-gray-400">/ {total}</span>}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`text-sm font-medium flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {change}
        </span>
        <span className="text-sm text-gray-500">vs прошлая неделя</span>
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  // Кэшируем статистику
  const getStats = unstable_cache(
    async () => {
      const [
        totalUsers,
        activeMembers,
        tasksCompleted,
        totalXP
      ] = await Promise.all([
        prisma.user.count(),
        prisma.parliamentMember.count({ where: { isActive: true } }),
        prisma.task.count({ where: { status: 'COMPLETED' } }),
        prisma.parliamentMember.aggregate({ _sum: { xp: true } })
      ])
      
      return { totalUsers, activeMembers, tasksCompleted, totalXP: totalXP._sum.xp || 0 }
    },
    ['admin-dashboard-stats'],
    { revalidate: 60 }
  )

  const stats = await getStats()

  // Топ студенты
  const topStudents = await prisma.user.findMany({
    orderBy: { ep: 'desc' },
    take: 5,
    include: { parliamentMember: true }
  })

  // Последняя активность
  const recentActivity = await prisma.feedEvent.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
            <p className="text-gray-600 mt-1">Обзор активности школы</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Администратор: {session.user.name}</span>
            <Link href="/sch1/dashboard" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              В обычный режим →
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Активные пользователи"
            value={stats.totalUsers}
            change="+12%"
            trend="up"
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Выполнено задач"
            value={stats.tasksCompleted}
            change="+23%"
            trend="up"
            icon={CheckCircle}
            color="green"
          />
          <KPICard
            title="Члены Парламента"
            value={stats.activeMembers}
            change="+5"
            trend="up"
            icon={Award}
            color="purple"
          />
          <KPICard
            title="Всего XP"
            value={stats.totalXP.toLocaleString()}
            change="+15%"
            trend="up"
            icon={TrendingUp}
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Students */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Топ учеников</h3>
              <Link href="/sch1/admin/users" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Все пользователи
              </Link>
            </div>
            
            <div className="space-y-4">
              {topStudents.map((student, idx) => (
                <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.class || 'Без класса'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-indigo-600">{student.ep} EP</div>
                    {student.parliamentMember && (
                      <div className="text-xs text-purple-600">{student.parliamentMember.xp} XP</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Последняя активность</h3>
            </div>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user.name}</span> {activity.description}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">Активности пока нет</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Link href="/sch1/admin/tasks/new" className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="font-semibold text-gray-900">Создать задачу</span>
            </div>
            <p className="text-sm text-gray-500">Добавить новую задачу для учеников или парламента</p>
          </Link>
          
          <Link href="/sch1/admin/reports" className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900">Проверка отчетов</span>
            </div>
            <p className="text-sm text-gray-500">Проверить выполненные задачи учеников</p>
          </Link>

          <Link href="/sch1/admin/settings" className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-semibold text-gray-900">Настройки системы</span>
            </div>
            <p className="text-sm text-gray-500">Управление баллами, сезонами и доступами</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
