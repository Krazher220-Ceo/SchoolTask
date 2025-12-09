import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AdminSidebar from '@/app/components/AdminSidebar'

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

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
              <h1 className="text-xl font-bold text-gray-900">Настройки</h1>
              <div className="w-24"></div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Настройки системы</h2>
            <p className="text-gray-600">Настройки системы будут доступны здесь в будущем.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

