'use client'

import { useState } from 'react'
import { Edit, Save, X, Trash2, Award, Plus, Eye, EyeOff } from 'lucide-react'
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
  telegramId: string | null
  telegramUsername: string | null
  parliamentMember: {
    id: string
    ministry: string
    position: string | null
    shift: string | null
    xp: number
    level: number
    rank: string
  } | null
}

export default function UserManagementClient({
  users,
  ministries,
  roles,
}: {
  users: User[]
  ministries: string[]
  roles: string[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedUser, setEditedUser] = useState<Partial<User> | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<'name' | 'class' | 'ministry' | 'role'>('class')
  const [filterClass, setFilterClass] = useState<string>('')
  const [filterMinistry, setFilterMinistry] = useState<string>('')

  // Получаем уникальные классы для фильтра
  const uniqueClasses = Array.from(new Set(users.map(u => u.fullClass).filter(Boolean))) as string[]

  const startEdit = (user: User) => {
    setEditingId(user.id)
    setEditedUser({
      role: user.role,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      parliamentMember: user.parliamentMember ? {
        ...user.parliamentMember,
      } : null,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditedUser(null)
  }

  const saveUser = async (userId: string) => {
    if (!editedUser) return

    setLoading(true)
    try {
      const updateData: any = {
        role: editedUser.role,
        telegramId: editedUser.telegramId || null,
        telegramUsername: editedUser.telegramUsername || null,
        parliamentMember: editedUser.parliamentMember,
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при обновлении пользователя')
      }
    } catch (error) {
      alert('Ошибка при обновлении пользователя')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userName}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/delete`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при удалении пользователя')
      }
    } catch (error) {
      alert('Ошибка при удалении пользователя')
    } finally {
      setLoading(false)
    }
  }

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
        setShowPassword({ ...showPassword, [userId]: true })
        alert(`Новый пароль для пользователя: ${data.password}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при сбросе пароля')
      }
    } catch (error) {
      alert('Ошибка при сбросе пароля')
    } finally {
      setLoading(false)
    }
  }

  const awardXP = async (userId: string) => {
    const amount = prompt('Введите количество XP для начисления:')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return
    }

    const reason = prompt('Причина начисления (опционально):') || undefined

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Number(amount), reason }),
      })

      if (response.ok) {
        alert(`Начислено ${amount} XP`)
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при начислении XP')
      }
    } catch (error) {
      alert('Ошибка при начислении XP')
    } finally {
      setLoading(false)
    }
  }

  const awardEP = async (userId: string) => {
    const amount = prompt('Введите количество EP для начисления:')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return
    }

    const reason = prompt('Причина начисления (опционально):') || undefined

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/ep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Number(amount), reason }),
      })

      if (response.ok) {
        alert(`Начислено ${amount} EP`)
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при начислении EP')
      }
    } catch (error) {
      alert('Ошибка при начислении EP')
    } finally {
      setLoading(false)
    }
  }

  // Фильтрация и сортировка
  let filteredUsers = users.filter(user => {
    if (filterClass && user.fullClass !== filterClass) return false
    if (filterMinistry && user.parliamentMember?.ministry !== filterMinistry) return false
    return true
  })

  filteredUsers.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'class':
        return (a.fullClass || '').localeCompare(b.fullClass || '')
      case 'ministry':
        const aMinistry = a.parliamentMember?.ministry || ''
        const bMinistry = b.parliamentMember?.ministry || ''
        return aMinistry.localeCompare(bMinistry)
      case 'role':
        return a.role.localeCompare(b.role)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-4">
      {/* Фильтры и сортировка */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Сортировка</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="class">По классу</option>
              <option value="name">По имени</option>
              <option value="ministry">По министерству</option>
              <option value="role">По роли</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Фильтр по классу</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Все классы</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Фильтр по министерству</label>
            <select
              value={filterMinistry}
              onChange={(e) => setFilterMinistry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Все министерства</option>
              {ministries.map(m => (
                <option key={m} value={m}>{ministryNames[m]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterClass('')
                setFilterMinistry('')
                setSortBy('class')
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь / Логин
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Класс
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Министерство
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP / EP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">Логин: {user.login}</div>
                      {showPassword[user.id] && userPasswords[user.id] && (
                        <div className="text-xs text-green-600 font-mono mt-1">
                          Пароль: {userPasswords[user.id]}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.fullClass || user.class || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === user.id ? (
                      <select
                        value={editedUser?.role || user.role}
                        onChange={(e) => setEditedUser({
                          ...editedUser,
                          role: e.target.value,
                        })}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role === 'ADMIN' ? 'Администратор' :
                             role === 'MINISTER' ? 'Министр' :
                             role === 'MEMBER' ? 'Участник' : 'Ученик'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'MINISTER' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'MEMBER' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'ADMIN' ? 'Администратор' :
                         user.role === 'MINISTER' ? 'Министр' :
                         user.role === 'MEMBER' ? 'Участник' : 'Ученик'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === user.id ? (
                      <select
                        value={editedUser?.parliamentMember?.ministry || user.parliamentMember?.ministry || ''}
                        onChange={(e) => {
                          const ministry = e.target.value
                          setEditedUser({
                            ...editedUser,
                            parliamentMember: ministry ? {
                              ...(editedUser?.parliamentMember || {
                                id: user.parliamentMember?.id || '',
                                position: null,
                                shift: null,
                                xp: 0,
                                level: 1,
                                rank: 'Новичок',
                              }),
                              ministry,
                            } : null,
                          })
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Не в парламенте</option>
                        {ministries.map((m) => (
                          <option key={m} value={m}>
                            {ministryNames[m]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">
                        {user.parliamentMember 
                          ? ministryNames[user.parliamentMember.ministry] 
                          : '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.parliamentMember ? (
                        <>
                          {user.parliamentMember.xp} XP
                          <br />
                          <span className="text-xs text-gray-500">
                            Уровень {user.parliamentMember.level} ({user.parliamentMember.rank})
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {editingId === user.id ? (
                        <>
                          <button
                            onClick={() => saveUser(user.id)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900"
                            title="Сохранить"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 hover:text-red-900"
                            title="Отмена"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(user)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Редактировать"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => resetPassword(user.id)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900"
                            title="Сбросить пароль"
                          >
                            {showPassword[user.id] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                          {user.parliamentMember && (
                            <button
                              onClick={() => awardXP(user.id)}
                              disabled={loading}
                              className="text-purple-600 hover:text-purple-900"
                              title="Выдать XP"
                            >
                              <Award className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => awardEP(user.id)}
                            disabled={loading}
                            className="text-orange-600 hover:text-orange-900"
                            title="Выдать EP"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900"
                            title="Удалить"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
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
