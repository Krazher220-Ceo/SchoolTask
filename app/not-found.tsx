import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Страница не найдена</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          К сожалению, страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link
          href="/"
          className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          <Home className="h-5 w-5 mr-2" />
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}


