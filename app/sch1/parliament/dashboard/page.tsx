'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  name: string
  ministry: string
  role: string
  xp: number
  xpToNextRank: number
  parliamentRank: string
  parliamentRankIcon: string
  ep: number
  schoolRank: string
  schoolPlace: number
}

export default function ParliamentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mode, setMode] = useState<'school' | 'parliament'>('parliament')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sch1/login')
      return
    }

    if (status === 'loading') {
      return
    }

    // Загружаем данные пользователя из API
    async function fetchUserData() {
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const userData = await response.json()
          
          // Получаем данные министерства
          const ministryNames: Record<string, string> = {
            'LAW_AND_ORDER': 'Права и порядка',
            'INFORMATION': 'Информации',
            'SPORT': 'Спорта',
            'CARE': 'Заботы'
          }

          setUser({
            name: userData.name || 'Пользователь',
            ministry: userData.ministry ? ministryNames[userData.ministry] || userData.ministry : 'Не указано',
            role: 'Министр', // TODO: Получить из parliamentMember
            xp: userData.xp || 0,
            xpToNextRank: 800, // TODO: Вычислить на основе ранга
            parliamentRank: userData.parliamentRank || 'Новичок Парламента',
            parliamentRankIcon: '🏅',
            ep: userData.ep || 0,
            schoolRank: userData.rank || 'Наблюдатель',
            schoolPlace: 0 // TODO: Получить из рейтинга
          })
        }
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error)
        // Используем данные из сессии как fallback
        if (session?.user) {
          setUser({
            name: session.user.name || 'Пользователь',
            ministry: 'Не указано',
            role: 'Член',
            xp: 0,
            xpToNextRank: 500,
            parliamentRank: 'Новичок Парламента',
            parliamentRankIcon: '👤',
            ep: 0,
            schoolRank: 'Наблюдатель',
            schoolPlace: 0
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Не удалось загрузить данные</p>
          <Link href="/sch1" className="text-purple-600 hover:underline">Вернуться на главную</Link>
        </div>
      </div>
    )
  }

  const parliamentProgress = (user.xp / (user.xp + user.xpToNextRank)) * 100
  const schoolProgress = (user.ep / (user.ep + 200)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Parliament Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Mode Switcher */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setMode('school')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  mode === 'school'
                    ? 'bg-white/20 backdrop-blur-sm text-white font-medium'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🎯 Школьная гонка
              </button>
              <button
                onClick={() => setMode('parliament')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  mode === 'parliament'
                    ? 'bg-white/20 backdrop-blur-sm text-white font-medium'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                💼 Парламентская гонка
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-6">
            {/* Left */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl border-4 border-white/30">
                  {user.parliamentRankIcon}
                </div>
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-purple-500 rounded-full text-xs font-bold">
                  Парламент
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                <p className="text-white/80 mb-1">{user.role} • Министерство {user.ministry}</p>
                <p className="text-lg text-yellow-300 font-semibold">{user.parliamentRank}</p>
                
                <div className="flex gap-3 mt-3">
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <span className="font-semibold">{user.xp} XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Dual Progress */}
            <div className="flex gap-6">
              {/* Parliament XP */}
              <div className="text-center">
                <div className="text-sm text-white/70 mb-2">Парламент</div>
                <div className="relative w-28 h-28">
                  <svg className="transform -rotate-90 w-28 h-28">
                    <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      stroke="#FCD34D"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - parliamentProgress / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold">{user.xp}</div>
                    <div className="text-xs text-white/70">XP</div>
                  </div>
                </div>
              </div>

              {/* School EP */}
              <div className="text-center opacity-50">
                <div className="text-sm text-white/70 mb-2">Школа</div>
                <div className="relative w-28 h-28">
                  <svg className="transform -rotate-90 w-28 h-28">
                    <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - schoolProgress / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold">{user.ep}</div>
                    <div className="text-xs text-white/70">EP</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ministry Tasks */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>📋</span>
                  Задачи министерства
                </h2>
                <Link
                  href="/sch1/tasks/new"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <span>+</span>
                  Создать задачу
                </Link>
              </div>

              <div className="space-y-3">
                {ministryTasks.map((task) => (
                  <MinistryTaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>

            {/* Parliament Projects */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">🎯 Текущие проекты</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parliamentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Ministry Stats */}
            <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
              <h3 className="font-bold mb-4">📊 Статистика министерства</h3>
              
              <div className="space-y-4">
                <StatItem label="Активных задач" value="12" icon="📝" />
                <StatItem label="Завершено за месяц" value="45" icon="✅" />
                <StatItem label="Членов министерства" value="8" icon="👥" />
                <StatItem label="Средний XP/чел" value="3,250" icon="⭐" />
              </div>
            </section>

            {/* Team Members */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold mb-4">👥 Команда министерства</h3>
              
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                    <div className="text-sm font-semibold text-purple-600">
                      {member.xp} XP
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold mb-4">⚡ Быстрые действия</h3>
              
              <div className="space-y-2">
                <QuickAction icon="📝" label="Создать задачу" />
                <QuickAction icon="📊" label="Отчет министерства" />
                <QuickAction icon="👥" label="Собрание команды" />
                <QuickAction icon="📢" label="Объявление" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function MinistryTaskCard({ task }: { task: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{task.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          task.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }`}>
          {task.status === 'pending' ? 'Ожидает' :
          task.status === 'in_progress' ? 'В работе' :
          'Завершено'}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span>👤</span>
            {task.assignedTo}
          </span>
          <span className="flex items-center gap-1">
            <span>📅</span>
            {task.deadline}
          </span>
        </div>
        
        <div className="font-bold text-purple-600">
          {task.reward} XP
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all">
      <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{project.deadline}</span>
        <span className="text-sm font-medium text-purple-600">{project.progress}%</span>
      </div>
    </div>
  )
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="font-bold text-purple-600">{value}</span>
    </div>
  )
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  )
}

// Mock Data
const ministryTasks = [
  {
    id: 1,
    title: 'Обновить школьный сайт',
    description: 'Добавить новые разделы и обновить дизайн',
    status: 'in_progress',
    assignedTo: 'Алихан',
    deadline: '25 дек',
    reward: 500
  },
  {
    id: 2,
    title: 'Создать промо-ролик',
    description: 'Видео о деятельности министерства',
    status: 'pending',
    assignedTo: 'София',
    deadline: '30 дек',
    reward: 300
  }
]

const parliamentProjects = [
  {
    id: 1,
    title: 'Цифровизация документооборота',
    description: 'Переход на электронный документооборот',
    deadline: '15 янв',
    progress: 65
  },
  {
    id: 2,
    title: 'Школьное радио',
    description: 'Запуск школьного радио канала',
    deadline: '20 янв',
    progress: 40
  }
]

const teamMembers = [
  { id: 1, name: 'София', role: 'Вице-министр', xp: 3800 },
  { id: 2, name: 'Марат', role: 'Член', xp: 3200 },
  { id: 3, name: 'Данияр', role: 'Член', xp: 2900 }
]

