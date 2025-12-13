'use client'

import { useState, useEffect } from 'react'
import { Flame, Snowflake } from 'lucide-react'

interface StreakData {
  id: string
  currentStreak: number
  longestStreak: number
  lastActivityAt: string
  freezeUsed: boolean
}

export default function StreakDisplay() {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreak()
    // Обновляем стрик при любой активности
    const handleActivity = () => {
      updateStreak()
    }
    
    // Слушаем события активности
    window.addEventListener('click', handleActivity)
    window.addEventListener('keydown', handleActivity)
    
    return () => {
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [])

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/streak')
      if (res.ok) {
        const data = await res.json()
        setStreak(data)
      }
    } catch (err) {
      console.error('Ошибка загрузки стрика:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStreak = async () => {
    try {
      const res = await fetch('/api/streak', {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setStreak(data)
      }
    } catch (err) {
      console.error('Ошибка обновления стрика:', err)
    }
  }

  if (loading || !streak) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg">
      <Flame className="h-5 w-5" />
      <span className="font-bold text-lg">{streak.currentStreak}</span>
      {streak.freezeUsed && (
        <div title="Заморозка активна">
          <Snowflake className="h-4 w-4 text-blue-200" />
        </div>
      )}
    </div>
  )
}

