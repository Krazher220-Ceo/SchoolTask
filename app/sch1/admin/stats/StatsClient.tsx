'use client'

import { useState, useEffect } from 'react'
import { Save, Calendar, Users, Lightbulb } from 'lucide-react'

export default function StatsClient() {
  const [stats, setStats] = useState({
    eventsCount: '1',
    membersCount: '15+',
    ideasCount: '10+',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats({
          eventsCount: data.eventsCount?.toString() || '1',
          membersCount: data.membersCount || '15+',
          ideasCount: data.ideasCount || '10+',
        })
      }
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/stats', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stats),
      })

      if (response.ok) {
        setMessage('Статистика успешно обновлена!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(error.error || 'Ошибка при сохранении')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setMessage('Ошибка при сохранении статистики')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Мероприятий проведено
          </label>
          <input
            type="text"
            value={stats.eventsCount}
            onChange={(e) => setStats({ ...stats, eventsCount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Примечание: Реальное количество завершенных мероприятий подсчитывается автоматически. 
            Это значение используется только если реальных мероприятий еще нет.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-600" />
            Участников парламента
          </label>
          <input
            type="text"
            value={stats.membersCount}
            onChange={(e) => setStats({ ...stats, membersCount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="15+"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-primary-600" />
            Реализованных идей
          </label>
          <input
            type="text"
            value={stats.ideasCount}
            onChange={(e) => setStats({ ...stats, ideasCount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="10+"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('успешно') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </div>
  )
}


