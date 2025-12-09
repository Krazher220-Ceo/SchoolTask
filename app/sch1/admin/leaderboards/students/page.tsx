import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Trophy, Plus, Trash2, Ban } from 'lucide-react'
import AdminSidebar from '@/app/components/AdminSidebar'
import StudentsLeaderboardClient from './StudentsLeaderboardClient'

export default async function StudentsLeaderboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  // Получаем топ учеников по EP
  const topStudents = await prisma.user.findMany({
    where: {
      role: { in: ['STUDENT', 'MEMBER'] },
    },
    include: {
      eventPoints: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  })

  // Вычисляем общий EP для каждого ученика
  const studentsWithEP = topStudents.map(user => {
    const totalEP = user.eventPoints.reduce((sum, ep) => sum + ep.amount, 0)
    return {
      ...user,
      totalEP,
    }
  })

  // Сортируем по EP
  studentsWithEP.sort((a, b) => b.totalEP - a.totalEP)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/sch1/admin" className="flex items-center text-gray-700 hover:text-primary-600">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Назад
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Лидерборд учеников (EP)</h1>
              <div className="w-24"></div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StudentsLeaderboardClient students={studentsWithEP} />
        </div>
      </div>
    </div>
  )
}

