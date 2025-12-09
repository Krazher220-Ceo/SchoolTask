import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Check, X, Clock } from 'lucide-react'
import PublicTasksClient from './PublicTasksClient'

export default async function PublicTasksAdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  const instances = await prisma.publicTaskInstance.findMany({
    where: {
      status: 'IN_REVIEW',
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          description: true,
          epReward: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          class: true,
        },
      },
      reviewer: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/sch1/admin" className="flex items-center text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад в админ-панель
            </Link>
            <h1 className="text-xl font-bold text-gray-900 ml-4">Общественные задачи на проверке</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PublicTasksClient instances={instances} />
      </div>
    </div>
  )
}

