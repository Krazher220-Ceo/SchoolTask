'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

export default function ApproveReportClient({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  const handleApprove = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/student-reports/${reportId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      })

      if (response.ok) {
        router.push('/sch1/students')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при одобрении отчета')
      }
    } catch (error) {
      alert('Ошибка при одобрении отчета')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Необходимо указать причину отклонения')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/student-reports/${reportId}/approve`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      })

      if (response.ok) {
        router.push('/sch1/students')
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Комментарий (опционально)
        </label>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Отличная работа! / Требуется доработка..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Link
          href="/sch1/students"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Отмена
        </Link>
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center disabled:opacity-50"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Отклонить
        </button>
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {loading ? 'Обработка...' : 'Одобрить и начислить EP'}
        </button>
      </div>
    </div>
  )
}

