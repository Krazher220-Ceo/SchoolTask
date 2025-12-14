'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Trophy, Shield, Plus } from 'lucide-react'

interface Guild {
  id: string
  name: string
  description: string
  icon: string
  memberCount: number
  totalXP: number
}

export default function GuildsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sch1/login')
      return
    }

    if (status === 'loading') {
      return
    }

    // Загружаем гильдии из API
    async function fetchGuilds() {
      try {
        const response = await fetch('/api/guilds')
        if (response.ok) {
          const data = await response.json()
          setGuilds(data.guilds || [])
        }
      } catch (error) {
        console.error('Ошибка загрузки гильдий:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGuilds()
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка гильдий...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1" className="flex items-center gap-2 text-gray-700 hover:text-indigo-600">
              ← Назад
            </Link>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-600" />
              Гильдии
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Что такое гильдии?</h2>
          <p className="text-gray-600 mb-6">
            Гильдии — это команды учеников, которые объединяются для совместного выполнения задач и соревнований. 
            Вступайте в гильдию или создайте свою, чтобы получать бонусы и участвовать в командных мероприятиях!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <Trophy className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Командные достижения</h3>
              <p className="text-sm text-gray-600">Получайте бонусы за командную работу</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Защита стрика</h3>
              <p className="text-sm text-gray-600">Члены гильдии помогают сохранить стрик</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Новые друзья</h3>
              <p className="text-sm text-gray-600">Знакомьтесь с единомышленниками</p>
            </div>
          </div>
        </div>

        {/* Guild List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Доступные гильдии</h2>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="h-4 w-4" />
              Создать гильдию
            </button>
          </div>

          {guilds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guilds.map((guild) => (
                <div key={guild.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{guild.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{guild.name}</h3>
                      <p className="text-sm text-gray-500">{guild.memberCount} участников</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{guild.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-600">{guild.totalXP} XP</span>
                    <button className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors">
                      Вступить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Гильдий пока нет</h3>
              <p className="text-gray-600 mb-4">Станьте первым, кто создаст гильдию!</p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
                Создать первую гильдию
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

