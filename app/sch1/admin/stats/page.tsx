import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import StatsClient from './StatsClient'

export const dynamic = 'force-dynamic'

export default async function StatsAdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/sch1/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Управление статистикой</h1>
          <p className="text-gray-600 mt-2">Редактируйте статистику, отображаемую на главной странице</p>
        </div>
        <StatsClient />
      </div>
    </div>
  )
}

