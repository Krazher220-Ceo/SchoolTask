'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Plus, Trash2, Ban, UserPlus } from 'lucide-react'

export default function StudentsLeaderboardClient({ students }: { students: any[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddToLeaderboard = async (userId: string) => {
    setProcessing(userId)
    try {
      const res = await fetch('/api/leaderboards/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'add',
          leaderboardType: 'students',
        }),
      })
      if (res.ok) {
        alert('Пользователь добавлен в лидерборд')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при добавлении')
      }
    } catch (error) {
      alert('Ошибка при добавлении')
    } finally {
      setProcessing(null)
    }
  }

  const handleRemoveFromLeaderboard = async (userId: string) => {
    if (!confirm('Удалить пользователя из лидерборда?')) return
    setProcessing(userId)
    try {
      const res = await fetch('/api/leaderboards/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'remove',
          leaderboardType: 'students',
        }),
      })
      if (res.ok) {
        alert('Пользователь удален из лидерборда')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при удалении')
      }
    } catch (error) {
      alert('Ошибка при удалении')
    } finally {
      setProcessing(null)
    }
  }

  const handleBanUser = async (userId: string) => {
    if (!confirm('Отстранить пользователя от лидерборда?')) return
    setProcessing(userId)
    try {
      const res = await fetch('/api/leaderboards/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'ban',
          leaderboardType: 'students',
        }),
      })
      if (res.ok) {
        alert('Пользователь отстранен от лидерборда')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при отстранении')
      }
    } catch (error) {
      alert('Ошибка при отстранении')
    } finally {
      setProcessing(null)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Поиск и фильтры */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Топ учеников по EP</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </button>
          </div>
        </div>

        {/* Таблица лидерборда */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Место</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ученик</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Класс</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">EP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.fullClass || student.class || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary-600">{student.totalEP} EP</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRemoveFromLeaderboard(student.id)}
                        disabled={processing === student.id}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Удалить из лидерборда"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleBanUser(student.id)}
                        disabled={processing === student.id}
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Отстранить"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

