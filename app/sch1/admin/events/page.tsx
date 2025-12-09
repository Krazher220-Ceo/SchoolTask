import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EventsClient from './EventsClient'

export const dynamic = 'force-dynamic'

export default async function EventsAdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/sch1/login')
  }

  const events = await prisma.event.findMany({
    orderBy: {
      date: 'desc',
    },
    include: {
      participants: true,
    },
  })

  // Преобразуем даты в строки для клиентского компонента
  const eventsForClient = events.map(event => ({
    ...event,
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Управление мероприятиями</h1>
          <p className="text-gray-600 mt-2">Создавайте и редактируйте мероприятия парламента</p>
        </div>
        <EventsClient initialEvents={eventsForClient} />
      </div>
    </div>
  )
}

