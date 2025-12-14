import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/app/components/Sidebar'

export default async function SCH1Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Для страниц, которые требуют авторизации, проверяем сессию
  // Но не редиректим, так как некоторые страницы могут быть публичными

  return (
    <div className="min-h-screen bg-gray-50">
      {session && (
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      )}
      {!session && (
        <main>
          {children}
        </main>
      )}
    </div>
  )
}

