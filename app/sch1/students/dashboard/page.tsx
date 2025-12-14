'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface User {
  name: string
  class: string
  rank: string
  rankIcon: string
  ep: number
  epToNextRank: number
  xp: number
  level: number
  streak: number
  achievements: number
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Загрузить данные пользователя из API
    setUser({
      name: 'Алихан',
      class: '9А',
      rank: 'Лидер Мнений',
      rankIcon: '💫',
      ep: 3800,
      epToNextRank: 200,
      xp: 0,
      level: 5,
      streak: 23,
      achievements: 45
    })
    setLoading(false)
  }, [])

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>
  }

  const progressPercent = (user.ep / (user.ep + user.epToNextRank)) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-6">
            {/* Left: User Info */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl border-4 border-white/30">
                  {user.rankIcon}
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center text-sm border-4 border-white">
                  {user.level}
                </div>
              </div>

              {/* Info */}
              <div>
                <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                <p className="text-white/80 mb-3">{user.class} • {user.rank}</p>
                
                {/* Stats Pills */}
                <div className="flex gap-3 flex-wrap">
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-2">
                    <span>🔥</span>
                    <span className="font-semibold">{user.streak} дней</span>
                  </div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-2">
                    <span>🏆</span>
                    <span className="font-semibold">{user.achievements} ачивок</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Progress Ring */}
            <div className="text-center">
              <div className="relative w-32 h-32">
                {/* SVG Progress Ring */}
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercent / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold">{user.ep}</div>
                  <div className="text-xs text-white/80">EP</div>
                </div>
              </div>
              <p className="text-sm text-white/80 mt-2">
                {user.epToNextRank} EP до &quot;Герой Школы&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-16 mb-8">
          <QuickStatCard
            icon="⭐"
            label="Сезонный рейтинг"
            value="#12"
            subtext="из 700"
            gradient="from-yellow-400 to-orange-500"
          />
          <QuickStatCard
            icon="✅"
            label="Задач выполнено"
            value="87"
            subtext="за месяц"
            gradient="from-green-400 to-emerald-500"
          />
          <QuickStatCard
            icon="💰"
            label="Баланс"
            value="3,800"
            subtext="EP"
            gradient="from-blue-400 to-indigo-500"
          />
          <QuickStatCard
            icon="🎯"
            label="Квестов завершено"
            value="23/30"
            subtext="этот месяц"
            gradient="from-purple-400 to-pink-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Quests */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Ежедневные квесты</h2>
                <span className="text-sm text-gray-500">Обновление через 5ч 23м</span>
              </div>

              <div className="space-y-3">
                {dailyQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            </section>

            {/* Available Tasks */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Доступные задачи</h2>
                <Link href="/sch1/tasks" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                  Смотреть все →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Streak Calendar */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>🔥</span>
                Серия активности
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-orange-500">{user.streak}</div>
                <div className="text-sm text-gray-600">дней подряд</div>
              </div>

              {/* Mini Calendar */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, i) => {
                  const isActive = i < user.streak
                  const isToday = i === user.streak - 1
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md ${
                        isToday ? 'bg-orange-500 ring-2 ring-orange-300' :
                        isActive ? 'bg-orange-200' :
                        'bg-gray-100'
                      }`}
                    />
                  )
                })}
              </div>

              <p className="text-xs text-gray-600 mt-4 text-center">
                Не прерывай серию! Выполни задачу сегодня 💪
              </p>
            </section>

            {/* Leaderboard Widget */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold mb-4">🏆 Топ-5 недели</h3>
              
              <div className="space-y-3">
                {topUsers.slice(0, 5).map((u, idx) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {idx + 1}
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-semibold">
                      {u.name.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-medium">{u.name}</div>
                    </div>

                    <div className="text-sm font-bold text-indigo-600">
                      {u.ep} EP
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickStatCard({ icon, label, value, subtext, gradient }: {
  icon: string
  label: string
  value: string
  subtext: string
  gradient: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{subtext}</div>
    </motion.div>
  )
}

function QuestCard({ quest }: { quest: any }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
      <div className="flex-shrink-0">
        {quest.completed ? (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
            ✓
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="font-medium text-gray-900">{quest.title}</div>
        <div className="text-sm text-gray-600">{quest.description}</div>
      </div>

      <div className="text-right">
        <div className="font-bold text-indigo-600">+{quest.reward} EP</div>
        {quest.bonus && (
          <div className="text-xs text-green-600">+{quest.bonus} бонус</div>
        )}
      </div>
    </div>
  )
}

function TaskCard({ task }: { task: any }) {
  return (
    <Link href={`/sch1/tasks/${task.id}`}>
      <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {task.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">{task.category}</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{task.difficulty}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>👥</span>
            <span>{task.slotsLeft}/{task.slots} мест</span>
          </div>
          
          <div className="font-bold text-indigo-600">
            +{task.reward} EP
          </div>
        </div>
      </div>
    </Link>
  )
}

// Mock Data
const dailyQuests = [
  {
    id: 1,
    title: 'Помоги однокласснику с домашкой',
    description: 'Помощь минимум 15 минут',
    reward: 10,
    completed: true
  },
  {
    id: 2,
    title: 'Убери свой класс после уроков',
    description: 'Сфотографируй результат',
    reward: 15,
    completed: false
  },
  {
    id: 3,
    title: 'Сделай доброе дело',
    description: 'Любое доброе дело + описание',
    reward: 20,
    bonus: 10,
    completed: false
  }
]

const availableTasks = [
  {
    id: 1,
    title: 'Организовать субботник',
    description: 'Уборка школьной территории с командой',
    category: 'Физическая',
    difficulty: 'Средняя',
    reward: 150,
    slots: 10,
    slotsLeft: 3
  },
  {
    id: 2,
    title: 'Дизайн афиши для концерта',
    description: 'Создать привлекательный дизайн',
    category: 'Творческая',
    difficulty: 'Легкая',
    reward: 100,
    slots: 1,
    slotsLeft: 1
  }
]

const topUsers = [
  { id: 1, name: 'Алихан', ep: 2450 },
  { id: 2, name: 'София', ep: 2380 },
  { id: 3, name: 'Марат', ep: 2210 },
  { id: 4, name: 'Данияр', ep: 2150 },
  { id: 5, name: 'Айжан', ep: 2100 }
]

