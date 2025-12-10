import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminSidebar from '@/app/components/AdminSidebar'
import { ArrowLeft, UserPlus, Edit, Shield } from 'lucide-react'
import { ministryNames } from '@/lib/utils'
import UserManagementClient from './UserManagementClient'

export default async function UsersManagementPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  const users = await prisma.user.findMany({
    include: {
      parliamentMember: true,
      registrationRequest: {
        select: {
          login: true,
        },
      },
    },
    orderBy: [
      { fullClass: 'asc' },
      { name: 'asc' },
    ],
  })

  const ministries = ['LAW_AND_ORDER', 'INFORMATION', 'SPORT', 'CARE']
  const roles = ['STUDENT', 'MEMBER', 'MINISTER', 'ADMIN']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/admin" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Управление пользователями</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserManagementClient 
          users={users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            class: u.class,
            classLetter: u.classLetter,
            fullClass: u.fullClass,
            login: u.registrationRequest?.login || u.email.split('@')[0],
            role: u.role,
            telegramId: u.telegramId,
            telegramUsername: u.telegramUsername,
            parliamentMember: u.parliamentMember ? {
              id: u.parliamentMember.id,
              ministry: u.parliamentMember.ministry,
              position: u.parliamentMember.position,
              shift: u.parliamentMember.shift,
              xp: u.parliamentMember.xp,
              level: u.parliamentMember.level,
              rank: u.parliamentMember.rank,
            } : null,
          }))}
          ministries={ministries}
          roles={roles}
        />
      </div>
      </div>
    </div>
  )
}

