'use client'

import { useState } from 'react'
import { Download, FileText, Eye, EyeOff } from 'lucide-react'
import { ministryNames } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  class: string | null
  classLetter: string | null
  fullClass: string | null
  login: string
  role: string
  parliamentMember: {
    ministry: string
    position: string | null
  } | null
}

export default function ReportsClient({
  users,
  ministries,
  uniqueClasses,
}: {
  users: User[]
  ministries: string[]
  uniqueClasses: string[]
}) {
  const [selectedMinistry, setSelectedMinistry] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const resetPassword = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const data = await response.json()
        setUserPasswords({ ...userPasswords, [userId]: data.password })
        return data.password
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при получении пароля')
        return null
      }
    } catch (error) {
      alert('Ошибка при получении пароля')
      return null
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type: 'ministry' | 'class') => {
    let filteredUsers = users

    if (type === 'ministry' && selectedMinistry) {
      filteredUsers = users.filter(u => u.parliamentMember?.ministry === selectedMinistry)
    } else if (type === 'class' && selectedClass) {
      filteredUsers = users.filter(u => u.fullClass === selectedClass)
    }

    // Получаем пароли для всех пользователей
    const passwords: Record<string, string> = {}
    for (const user of filteredUsers) {
      if (!userPasswords[user.id]) {
        const password = await resetPassword(user.id)
        if (password) {
          passwords[user.id] = password
        }
      } else {
        passwords[user.id] = userPasswords[user.id]
      }
    }

    setUserPasswords({ ...userPasswords, ...passwords })

    // Формируем отчет
    let report = ''
    if (type === 'ministry') {
      report = `Отчет по паролям - ${ministryNames[selectedMinistry]}\n`
      report += `Дата: ${new Date().toLocaleDateString('ru-RU')}\n\n`
    } else {
      report = `Отчет по паролям - Класс ${selectedClass}\n`
      report += `Дата: ${new Date().toLocaleDateString('ru-RU')}\n\n`
    }

    report += 'ФИО\tЛогин\tEmail\tПароль\tКласс\tРоль\n'
    report += '─'.repeat(80) + '\n'

    filteredUsers.forEach(user => {
      const password = passwords[user.id] || '***'
      report += `${user.name}\t${user.login}\t${user.email}\t${password}\t${user.fullClass || user.class || '—'}\t${user.role}\n`
    })

    // Создаем и скачиваем файл
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = type === 'ministry' 
      ? `passwords_${selectedMinistry}_${new Date().toISOString().split('T')[0]}.txt`
      : `passwords_class_${selectedClass}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Фильтрация пользователей
  let filteredUsers = users
  if (selectedMinistry) {
    filteredUsers = filteredUsers.filter(u => u.parliamentMember?.ministry === selectedMinistry)
  }
  if (selectedClass) {
    filteredUsers = filteredUsers.filter(u => u.fullClass === selectedClass)
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Фильтры для отчетов</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Отчет по министерству
            </label>
            <div className="flex gap-2">
              <select
                value={selectedMinistry}
                onChange={(e) => {
                  setSelectedMinistry(e.target.value)
                  setSelectedClass('')
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Выберите министерство</option>
                {ministries.map(m => (
                  <option key={m} value={m}>{ministryNames[m]}</option>
                ))}
              </select>
              <button
                onClick={() => generateReport('ministry')}
                disabled={!selectedMinistry || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Скачать
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Отчет по классу
            </label>
            <div className="flex gap-2">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setSelectedMinistry('')
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Выберите класс</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <button
                onClick={() => generateReport('class')}
                disabled={!selectedClass || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Скачать
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Предпросмотр данных */}
      {(selectedMinistry || selectedClass) && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedMinistry 
                ? `Пользователи министерства: ${ministryNames[selectedMinistry]}`
                : `Пользователи класса: ${selectedClass}`}
              <span className="ml-2 text-sm text-gray-500">({filteredUsers.length})</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Логин</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Класс</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пароль</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.login}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.fullClass || user.class || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userPasswords[user.id] ? (
                        <span className="text-sm font-mono text-green-600">{userPasswords[user.id]}</span>
                      ) : (
                        <button
                          onClick={() => resetPassword(user.id)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Получить пароль
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

