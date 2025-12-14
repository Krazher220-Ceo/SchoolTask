'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function AdminDashboardEnhanced() {
  const [stats, setStats] = useState(null)
  const [timeRange, setTimeRange] = useState('week') // week, month, year

  useEffect(() => {
    // TODO: Загрузить статистику из API
    setStats({
      activeUsers: { value: 687, total: 700, change: 12, trend: 'up' },
      completedTasks: { value: 1234, change: 23, trend: 'up' },
      avgEP: { value: 145, change: -5, trend: 'down' },
      newAchievements: { value: 89, change: 45, trend: 'up' }
    })
  }, [timeRange])

  if (!stats) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
          <p className="text-gray-600 mt-1">Обзор активности школы</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {['Неделя', 'Месяц', 'Год'].map((label, idx) => (
            <button
              key={label}
              className={`px-4 py-2 rounded-md transition-all ${
                timeRange === ['week', 'month', 'year'][idx]
                  ? 'bg-white shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setTimeRange(['week', 'month', 'year'][idx])}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Активные пользователи"
          value="687"
          total="700"
          change="+12%"
          trend="up"
          icon="👥"
          color="blue"
        />
        <KPICard
          title="Выполнено задач"
          value="1,234"
          change="+23%"
          trend="up"
          icon="✅"
          color="green"
        />
        <KPICard
          title="Средний EP/день"
          value="145"
          change="-5%"
          trend="down"
          icon="⭐"
          color="yellow"
        />
        <KPICard
          title="Новые достижения"
          value="89"
          change="+45%"
          trend="up"
          icon="🏆"
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Активность по дням</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
              <option>Задачи</option>
              <option>EP заработано</option>
              <option>Новые пользователи</option>
            </select>
          </div>
          
          {/* Simple line chart placeholder */}
          <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-end justify-around p-4">
            {[40, 65, 45, 80, 70, 90, 75].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1 }}
                className="w-12 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg"
              />
            ))}
          </div>
          
          <div className="flex justify-around mt-4 text-sm text-gray-600">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6">Топ-10 учеников недели</h3>
          
          <div className="space-y-3">
            {topStudents.map((student, idx) => (
              <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Rank */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                  idx === 1 ? 'bg-gray-100 text-gray-700' :
                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {idx + 1}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                  {student.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.class}</div>
                </div>

                {/* EP */}
                <div className="text-right">
                  <div className="font-bold text-indigo-600">{student.ep} EP</div>
                  <div className="text-xs text-green-600">+{student.growth}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Последняя активность</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Посмотреть всё →
          </button>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity, idx) => (
            <ActivityItem key={idx} {...activity} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          icon="➕"
          title="Создать задачу"
          description="Добавить новую задачу для учеников"
          action={() => {/* navigate */}}
        />
        <QuickActionCard
          icon="📊"
          title="Экспорт отчета"
          description="Скачать статистику за период"
          action={() => {/* export */}}
        />
        <QuickActionCard
          icon="🔔"
          title="Отправить уведомление"
          description="Массовое уведомление пользователям"
          action={() => {/* notify */}}
        />
      </div>
    </div>
  )
}

function KPICard({ title, value, total, change, trend, icon, color }: {
  title: string
  value: string
  total?: string
  change: string
  trend: 'up' | 'down'
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
}) {
  const colors = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {total && <span className="text-gray-400">/ {total}</span>}
          </div>
        </div>
        
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </span>
        <span className="text-sm text-gray-500">vs прошлая неделя</span>
      </div>
    </motion.div>
  )
}

function ActivityItem({ type, user, action, time, details }: {
  type: string
  user: string
  action: string
  time: string
  details?: string
}) {
  const icons: Record<string, string> = {
    task: '✅',
    achievement: '🏆',
    rank: '⭐',
    purchase: '🛒',
    report: '📝'
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
        {icons[type] || '📌'}
      </div>
      
      <div className="flex-1">
        <p className="text-gray-900">
          <span className="font-medium">{user}</span> {action}
        </p>
        {details && <p className="text-sm text-gray-600 mt-1">{details}</p>}
      </div>

      <span className="text-sm text-gray-500">{time}</span>
    </div>
  )
}

function QuickActionCard({ icon, title, description, action }: {
  icon: string
  title: string
  description: string
  action: () => void
}) {
  return (
    <button
      onClick={action}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all text-left"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  )
}

const topStudents = [
  { id: 1, name: 'Алихан', class: '9А', ep: 2450, growth: 23 },
  { id: 2, name: 'София', class: '10Б', ep: 2380, growth: 18 },
  { id: 3, name: 'Марат', class: '9А', ep: 2210, growth: 31 },
  { id: 4, name: 'Данияр', class: '10А', ep: 2150, growth: 15 },
  { id: 5, name: 'Айжан', class: '9Б', ep: 2100, growth: 22 },
  { id: 6, name: 'Ерлан', class: '10А', ep: 2050, growth: 19 },
  { id: 7, name: 'Амина', class: '9А', ep: 2000, growth: 25 },
  { id: 8, name: 'Темирлан', class: '10Б', ep: 1950, growth: 17 },
  { id: 9, name: 'Аружан', class: '9Б', ep: 1900, growth: 20 },
  { id: 10, name: 'Данияр', class: '10А', ep: 1850, growth: 16 }
]

const recentActivity = [
  {
    type: 'task',
    user: 'Алихан',
    action: 'выполнил задачу "Организация субботника"',
    time: '2 мин назад',
    details: '+150 EP'
  },
  {
    type: 'achievement',
    user: 'София',
    action: 'получила достижение "Месячный Марафон"',
    time: '15 мин назад'
  },
  {
    type: 'rank',
    user: 'Марат',
    action: 'достиг ранга "Лидер Мнений"',
    time: '1 час назад'
  },
  {
    type: 'purchase',
    user: 'Данияр',
    action: 'купил "Дабл-Буст" в магазине',
    time: '2 часа назад',
    details: '-800 EP'
  },
  {
    type: 'report',
    user: 'Айжан',
    action: 'отправил отчет по задаче',
    time: '3 часа назад'
  }
]

