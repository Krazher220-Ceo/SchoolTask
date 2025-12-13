'use client'

import { useState, useEffect } from 'react'
import { Trophy, TrendingUp } from 'lucide-react'
import { ministryNames } from '@/lib/utils'

interface MinistryWarData {
  stats: Record<string, number>
  totalEP: number
  winner: string | null
  date: string
}

const ministryColors: Record<string, string> = {
  LAW_AND_ORDER: 'bg-blue-500',
  INFORMATION: 'bg-pink-500',
  SPORT: 'bg-green-500',
  CARE: 'bg-red-500',
}

export default function MinistryWar() {
  const [warData, setWarData] = useState<MinistryWarData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWarData()
    // Обновляем каждые 5 минут
    const interval = setInterval(fetchWarData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchWarData = async () => {
    try {
      const res = await fetch('/api/ministry-war')
      if (res.ok) {
        const data = await res.json()
        setWarData(data)
      }
    } catch (err) {
      console.error('Ошибка загрузки битвы:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !warData) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  const ministries = Object.keys(warData.stats)
  const maxEP = Math.max(...Object.values(warData.stats), 1)

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
          Битва Министерств
        </h3>
        {warData.winner && (
          <div className="text-sm text-gray-600">
            Лидер: <span className="font-semibold">{ministryNames[warData.winner]}</span>
          </div>
        )}
      </div>

      {/* Горизонтальная шкала прогресса */}
      <div className="space-y-3">
        {ministries.map((ministry) => {
          const ep = warData.stats[ministry] || 0
          const percentage = maxEP > 0 ? (ep / maxEP) * 100 : 0
          const isWinner = warData.winner === ministry

          return (
            <div key={ministry} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">{ministryNames[ministry]}</span>
                <span className="text-gray-600 font-bold">{ep} EP</span>
              </div>
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${ministryColors[ministry]} transition-all duration-500 rounded-full flex items-center justify-end pr-2 ${
                    isWinner ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                  }`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 10 && (
                    <span className="text-white text-xs font-bold">{Math.round(percentage)}%</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Всего EP заработано:</span>
          <span className="font-bold text-gray-900">{warData.totalEP} EP</span>
        </div>
      </div>
    </div>
  )
}

