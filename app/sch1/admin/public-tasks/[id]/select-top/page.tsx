import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminSidebar from '@/app/components/AdminSidebar'
import { ArrowLeft } from 'lucide-react'
import SelectTopClient from '../../SelectTopClient'

export default async function SelectTopPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      topRanking: true,
      deadline: true,
      epReward: true,
      selectedTopInstances: true,
      topAwarded: true,
      taskType: true,
    },
  })

  if (!task || task.taskType !== 'PUBLIC' || !task.topRanking) {
    redirect('/sch1/admin/public-tasks')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/sch1/admin/public-tasks" className="flex items-center text-gray-700 hover:text-primary-600">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Назад
              </Link>
              <h1 className="text-xl font-bold text-gray-900 ml-4">Выбор топа для: {task.title}</h1>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SelectTopClient task={task} />
        </div>
      </div>
    </div>
  )
}

