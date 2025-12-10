import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ensureQuestsAssigned } from '@/lib/quests'
import QuestClient from './QuestClient'

export default async function StudentQuestsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  if (session.user.role === 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  // Убеждаемся, что квесты назначены (с обработкой ошибок)
  try {
    await ensureQuestsAssigned(session.user.id)
  } catch (error) {
    console.error('Ошибка при назначении квестов:', error)
    // Продолжаем выполнение даже если есть ошибка
  }

  // Получаем прогресс выполнения квестов
  const assignedQuests = await prisma.assignedQuest.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      quest: true,
    },
    orderBy: [
      { periodDate: 'desc' },
      { assignedAt: 'desc' },
    ],
  })

  // Группируем по типам и фильтруем только актуальные
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const weekStart = new Date(today)
  const dayOfWeek = today.getDay()
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  weekStart.setDate(diff)
  weekStart.setHours(0, 0, 0, 0)
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  monthStart.setHours(0, 0, 0, 0)

  const dailyQuests = assignedQuests.filter(aq => 
    aq.quest.type === 'DAILY' && 
    aq.periodDate.getTime() === today.getTime()
  )
  const weeklyQuests = assignedQuests.filter(aq => 
    aq.quest.type === 'WEEKLY' && 
    aq.periodDate.getTime() === weekStart.getTime()
  )
  const monthlyQuests = assignedQuests.filter(aq => 
    aq.quest.type === 'MONTHLY' && 
    aq.periodDate.getTime() === monthStart.getTime()
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
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
        <QuestClient 
          dailyQuests={dailyQuests}
          weeklyQuests={weeklyQuests}
          monthlyQuests={monthlyQuests}
        />
      </div>
    </div>
  )
}
