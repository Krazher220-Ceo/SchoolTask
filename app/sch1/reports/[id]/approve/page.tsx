'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Star } from 'lucide-react'

export default function ApproveReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string
  const [loading, setLoading] = useState(false)
  const [quality, setQuality] = useState(5)
  const [bonusXP, setBonusXP] = useState(0)

  const handleApprove = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/${reportId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quality,
          bonusXP: bonusXP || 0,
        }),
      })

      if (response.ok) {
        router.push('/sch1/admin')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/admin" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Одобрить отчет</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Оценка качества (1-5 звезд)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setQuality(star)}
                  className={`${quality >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Бонусные XP (опционально)
            </label>
            <input
              type="number"
              min="0"
              value={bonusXP}
              onChange={(e) => setBonusXP(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Дополнительные XP за отличную работу</p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/sch1/admin"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Отмена
            </Link>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loading ? 'Одобрение...' : 'Одобрить отчет'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


