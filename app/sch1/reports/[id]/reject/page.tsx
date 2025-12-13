'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, XCircle } from 'lucide-react'

export default function RejectReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Необходимо указать причину отклонения')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/reports/${reportId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback,
        }),
      })

      if (response.ok) {
        router.push('/sch1/admin')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при отклонении отчета')
      }
    } catch (error) {
      alert('Ошибка при отклонении отчета')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/admin" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Отклонить отчет</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Причина отклонения *
            </label>
            <textarea
              required
              rows={6}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Укажите, что нужно доработать в отчете..."
            />
            <p className="text-xs text-gray-500 mt-1">Этот комментарий будет отправлен исполнителю</p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/sch1/admin"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Отмена
            </Link>
            <button
              onClick={handleReject}
              disabled={loading || !feedback.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center disabled:opacity-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {loading ? 'Отклонение...' : 'Отклонить отчет'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


