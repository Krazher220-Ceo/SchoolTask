'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { ministryNames } from '@/lib/utils'

export default function NewTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [users, setUsers] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>('')
  const [userMinistry, setUserMinistry] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ministry: '',
    assignedToId: '',
    priority: 'MEDIUM',
    deadline: '',
    xpReward: 10,
    epReward: 0,
    targetAudience: 'PARLIAMENT_MEMBER',
    taskType: 'PRIVATE',
    tags: '',
  })

  useEffect(() => {
    // Проверяем параметр target из URL
    const params = new URLSearchParams(window.location.search)
    const target = params.get('target')
    if (target === 'student') {
      setFormData(prev => ({ ...prev, targetAudience: 'STUDENT', epReward: 10 }))
    }

    // Загружаем пользователей и информацию о текущем пользователе
    fetch('/api/users/list')
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users)
        if (data.role) setUserRole(data.role)
        if (data.ministry) {
          setUserMinistry(data.ministry)
          if (formData.targetAudience === 'PARLIAMENT_MEMBER') {
            setFormData(prev => ({ ...prev, ministry: data.ministry }))
          }
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          ministry: (formData.targetAudience === 'PARLIAMENT_MEMBER' || formData.targetAudience === 'PUBLIC') ? (formData.ministry || null) : null,
          assignedToId: formData.assignedToId || null,
          priority: formData.priority,
          deadline: formData.deadline || null,
          xpReward: formData.targetAudience === 'PARLIAMENT_MEMBER' ? (formData.xpReward || 10) : null,
          epReward: (formData.targetAudience === 'STUDENT' || formData.targetAudience === 'PUBLIC') ? (formData.epReward || 0) : null,
          targetAudience: formData.targetAudience,
          taskType: formData.taskType || (formData.targetAudience === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'),
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        }),
      })

      if (response.ok) {
        router.push('/sch1/tasks')
        router.refresh()
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || errorData.details || 'Ошибка при создании задачи'
        setError(errorMessage)
        console.error('Ошибка создания задачи:', errorData)
      }
    } catch (error) {
      console.error('Ошибка при создании задачи:', error)
      setError('Произошла ошибка при создании задачи. Проверьте консоль для деталей.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/tasks" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Создать задачу</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Ошибка:</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Название задачи *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите название задачи"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Подробное описание задачи..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Для кого задача *
            </label>
            <select
              required
              value={formData.targetAudience}
              onChange={(e) => {
                const target = e.target.value as 'PARLIAMENT_MEMBER' | 'STUDENT' | 'PUBLIC'
                setFormData({ 
                  ...formData, 
                  targetAudience: target,
                  taskType: target === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
                  ministry: target === 'STUDENT' ? '' : formData.ministry, // Для PUBLIC министерство опционально
                  epReward: (target === 'STUDENT' || target === 'PUBLIC') ? 10 : 0,
                  xpReward: target === 'PARLIAMENT_MEMBER' ? 10 : 0,
                })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="PARLIAMENT_MEMBER">Участники парламента (XP)</option>
              <option value="STUDENT">Ученики школы (EP)</option>
              <option value="PUBLIC">Общественная задача (EP) - каждый может взять</option>
            </select>
          </div>

          {(formData.targetAudience === 'PARLIAMENT_MEMBER' || formData.targetAudience === 'PUBLIC') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Министерство {formData.targetAudience === 'PUBLIC' ? '(опционально)' : '*'}
              </label>
              <select
                required={formData.targetAudience === 'PARLIAMENT_MEMBER'}
                value={formData.ministry}
                onChange={(e) => {
                  setFormData({ ...formData, ministry: e.target.value, assignedToId: '' })
                }}
                disabled={userRole === 'MINISTER' && formData.targetAudience === 'PARLIAMENT_MEMBER'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">{formData.targetAudience === 'PUBLIC' ? 'Для всех министерств' : 'Выберите министерство'}</option>
                <option value="LAW_AND_ORDER">Права и порядка</option>
                <option value="INFORMATION">Информации</option>
                <option value="SPORT">Спорта</option>
                <option value="CARE">Заботы</option>
              </select>
              {userRole === 'MINISTER' && formData.targetAudience === 'PARLIAMENT_MEMBER' && (
                <p className="text-xs text-gray-500 mt-1">Вы можете создавать задачи только для своего министерства</p>
              )}
              {formData.targetAudience === 'PUBLIC' && (
                <p className="text-xs text-gray-500 mt-1">Если министерство не выбрано, задача будет доступна для всех. Если выбрано - только для участников этого министерства.</p>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Приоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="LOW">Низкий</option>
                <option value="MEDIUM">Средний</option>
                <option value="HIGH">Высокий</option>
                <option value="CRITICAL">Критический</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Исполнитель (опционально)
            </label>
            <select
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Не назначен</option>
              {users
                .filter((u: any) => 
                  !formData.ministry || 
                  u.parliamentMember?.ministry === formData.ministry
                )
                .map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.parliamentMember?.position ? `(${user.parliamentMember.position})` : ''}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Дедлайн
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {formData.targetAudience === 'PARLIAMENT_MEMBER' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Награда (XP) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
            {(formData.targetAudience === 'STUDENT' || formData.targetAudience === 'PUBLIC') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Награда (EP) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.epReward}
                  onChange={(e) => setFormData({ ...formData, epReward: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">EP начисляются ученикам за выполнение задачи</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Теги (через запятую)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="важно, срочно, проект"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/sch1/tasks"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Создание...' : 'Создать задачу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

