import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function SCH1Layout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout просто рендерит children
  // Sidebar будет добавлен на уровне отдельных страниц где нужно
  return (
    <>
      {children}
    </>
  )
}

