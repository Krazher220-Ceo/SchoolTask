import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Target } from 'lucide-react'
import { ensureQuestsAssigned } from '@/lib/quests'

export default async function StudentQuestsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  if (session.user.role === 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  // Убеждаемся, что квесты назначены
  await ensureQuestsAssigned(session.user.id)

  // Получаем прогресс выполнения квестов
  const assignedQuests = await prisma.assignedQuest.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      quest: true,
    },
    orderBy: [
      { periodStart: 'asc' },
      { assignedAt: 'desc' },
    ],
  })

  // Группируем по типам (используем quest.period)
  const dailyQuests = assignedQuests.filter(aq => aq.quest.period === 'DAILY')
  const weeklyQuests = assignedQuests.filter(aq => aq.quest.period === 'WEEKLY')
  const monthlyQuests = assignedQuests.filter(aq => aq.quest.period === 'MONTHLY')

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
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
              >
                Задачи
              </Link>
              <Link
                href="/sch1/students/quests"
                className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold"
              >
                Мои задания
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ежедневные задания */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Ежедневные задания</h2>
            <span className="ml-2 text-sm text-gray-500">(3 из 100)</span>
          </div>
          {dailyQuests.length > 0 ? (
            <div className="space-y-3">
              {dailyQuests.map((aq) => (
                <div
                  key={aq.id}
                  className={`border-2 rounded-lg p-4 ${
                    aq.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{aq.quest.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{aq.quest.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Награда: {aq.quest.epReward} EP</span>
                        {aq.completedAt && (
                          <span>Выполнено: {new Date(aq.completedAt).toLocaleDateString('ru-RU')}</span>
                        )}
                      </div>
                    </div>
                    {aq.completed ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        ✓ Выполнено
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        В процессе
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Нет ежедневных заданий</p>
          )}
        </div>

        {/* Недельные задания */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Недельные задания</h2>
            <span className="ml-2 text-sm text-gray-500">(2 из 50)</span>
          </div>
          {weeklyQuests.length > 0 ? (
            <div className="space-y-3">
              {weeklyQuests.map((aq) => (
                <div
                  key={aq.id}
                  className={`border-2 rounded-lg p-4 ${
                    aq.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{aq.quest.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{aq.quest.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Награда: {aq.quest.epReward} EP</span>
                        {aq.completedAt && (
                          <span>Выполнено: {new Date(aq.completedAt).toLocaleDateString('ru-RU')}</span>
                        )}
                      </div>
                    </div>
                    {aq.completed ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        ✓ Выполнено
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        В процессе
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Нет недельных заданий</p>
          )}
        </div>

        {/* Месячные задания */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Target className="h-6 w-6 text-orange-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Месячные задания</h2>
            <span className="ml-2 text-sm text-gray-500">(1 из 25)</span>
          </div>
          {monthlyQuests.length > 0 ? (
            <div className="space-y-3">
              {monthlyQuests.map((aq) => (
                <div
                  key={aq.id}
                  className={`border-2 rounded-lg p-4 ${
                    aq.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{aq.quest.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{aq.quest.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Награда: {aq.quest.epReward} EP</span>
                        {aq.completedAt && (
                          <span>Выполнено: {new Date(aq.completedAt).toLocaleDateString('ru-RU')}</span>
                        )}
                      </div>
                    </div>
                    {aq.completed ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        ✓ Выполнено
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        В процессе
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Нет месячных заданий</p>
          )}
        </div>
      </div>
    </div>
  )
}

