'use client'

import { useState, useEffect } from 'react'
import { Star, User } from 'lucide-react'
import Link from 'next/link'

interface SpotlightData {
  id: string
  userId: string
  quote: string | null
  expiresAt: string
  user: {
    id: string
    name: string
    avatar: string | null
    class: string | null
  }
}

export default function Spotlight() {
  const [spotlight, setSpotlight] = useState<SpotlightData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpotlight()
    // Обновляем каждые 10 минут
    const interval = setInterval(fetchSpotlight, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchSpotlight = async () => {
    try {
      const res = await fetch('/api/spotlight')
      if (res.ok) {
        const data = await res.json()
        if (data && new Date(data.expiresAt) > new Date()) {
          setSpotlight(data)
        } else {
          setSpotlight(null)
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки Spotlight:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (!spotlight) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl p-6 shadow-xl text-white relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-4">
          <Star className="h-8 w-8 text-yellow-300 mr-2 animate-pulse" />
          <h3 className="text-2xl font-bold">Герой дня</h3>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          {spotlight.user.avatar ? (
            <img
              src={spotlight.user.avatar}
              alt={spotlight.user.name}
              className="w-16 h-16 rounded-full border-4 border-white/50 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-4 border-white/50 bg-white/20 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          )}
          <div>
            <h4 className="text-xl font-bold">{spotlight.user.name}</h4>
            {spotlight.user.class && (
              <p className="text-white/80 text-sm">{spotlight.user.class} класс</p>
            )}
          </div>
        </div>

        {spotlight.quote && (
          <p className="text-lg italic mb-4 text-white/90">&ldquo;{spotlight.quote}&rdquo;</p>
        )}

        <Link
          href={`/sch1/users/${spotlight.userId}`}
          className="inline-flex items-center text-white hover:text-yellow-200 transition font-semibold"
        >
          Посмотреть профиль →
        </Link>
      </div>
    </div>
  )
}

