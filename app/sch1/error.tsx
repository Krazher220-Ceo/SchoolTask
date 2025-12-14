'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function SCH1Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Логируем ошибку
    console.error('SCH1 Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Что-то пошло не так</h1>
        <p className="text-gray-600 mb-8">
          Произошла ошибка при загрузке страницы. Попробуйте обновить страницу или вернуться на главную.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Попробовать снова
          </button>
          <Link
            href="/sch1"
            className="inline-flex items-center justify-center bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300"
          >
            <Home className="h-5 w-5 mr-2" />
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}

