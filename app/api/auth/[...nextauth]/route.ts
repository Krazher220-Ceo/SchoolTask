import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Экспортируем обработчики для Next.js App Router
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Экспорт для совместимости
export default handler
