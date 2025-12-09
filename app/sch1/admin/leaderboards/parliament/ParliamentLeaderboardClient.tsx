'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Ban, Plus } from 'lucide-react'
import { ministryNames } from '@/lib/utils'

export default function ParliamentLeaderboardClient({ members }: { members: any[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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
          leaderboardType: 'parliament',
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
          leaderboardType: 'parliament',
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

  const filteredMembers = members.filter(m =>
    m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Топ участников парламента по XP</h2>
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Место</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Участник</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Министерство</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">XP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Уровень</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className="hover:bg-gray-50">
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
                  <td className="px-4 py-3 font-medium text-gray-900">{member.user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ministryNames[member.ministry] || member.ministry}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary-600">{member.xp} XP</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Уровень {member.level}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRemoveFromLeaderboard(member.userId)}
                        disabled={processing === member.userId}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Удалить из лидерборда"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleBanUser(member.userId)}
                        disabled={processing === member.userId}
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

