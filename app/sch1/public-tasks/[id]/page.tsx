'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Video, Link as LinkIcon } from 'lucide-react'

export default function PublicTaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  const [task, setTask] = useState<any>(null)
  const [instance, setInstance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [topLimit, setTopLimit] = useState<3 | 5 | 10>(10)
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [loadingTop, setLoadingTop] = useState(false)
  const [formData, setFormData] = useState({
    videoUrl: '',
    workLink: '',
    description: '',
  })

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Задача не найдена')
        }
        return res.json()
      })
      .then(data => {
        if (data.id) {
          setTask(data)
          // Загружаем инстанс задачи пользователя отдельно
          fetch(`/api/public-tasks/${taskId}/instance`)
            .then(res => res.ok ? res.json() : null)
            .then(instanceData => {
              // Проверяем, что instanceData существует и не null
              if (instanceData && instanceData.id) {
                setInstance(instanceData)
                if (instanceData.videoUrl || instanceData.workLink) {
                  setFormData({
                    videoUrl: instanceData.videoUrl || '',
                    workLink: instanceData.workLink || '',
                    description: instanceData.description || '',
                  })
                }
              }
            })
            .catch(() => {
              // Игнорируем ошибки при загрузке инстанса (это нормально, если пользователь еще не взял задачу)
            })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [taskId])

  const loadTopPerformers = async (limit: 3 | 5 | 10) => {
    setLoadingTop(true)
    try {
      const res = await fetch(`/api/public-tasks/top?taskId=${taskId}&limit=${limit}`)
      if (res.ok) {
        const data = await res.json()
        setTopPerformers(data.top || [])
        setTopLimit(limit)
      }
    } catch (error) {
      console.error('Ошибка загрузки топа:', error)
    } finally {
      setLoadingTop(false)
    }
  }

  useEffect(() => {
    if (task && task.taskType === 'PUBLIC') {
      loadTopPerformers(10)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task])

  const handleTakeTask = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/public-tasks/${taskId}/take`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setInstance(data)
        alert('Задача успешно взята!')
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при взятии задачи')
      }
    } catch (error) {
      alert('Ошибка при взятии задачи')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.videoUrl && !formData.workLink) {
      alert('Необходимо указать либо ссылку на видео, либо ссылку на работу')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/public-tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        alert('Задача успешно отправлена на проверку!')
        router.push('/sch1/students')
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при отправке задачи')
      }
    } catch (error) {
      alert('Ошибка при отправке задачи')
    } finally {
      setSubmitting(false)
    }
  }

  const openTelegram = () => {
    // Открываем Telegram бота для загрузки видео
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'sch_ly1_bot'
    window.open(`https://t.me/${botUsername}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Задача не найдена</h1>
          <Link href="/sch1/students" className="text-primary-600 hover:underline">
            Вернуться к задачам
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/sch1/students" className="flex items-center text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>
          <p className="text-gray-600 mb-4 whitespace-pre-line">{task.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Награда: {task.epReward} EP</span>
            {task.deadline && (
              <span>До: {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
            )}
            {task.ministry && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {task.ministry === 'LAW_AND_ORDER' ? 'Права и порядка' :
                 task.ministry === 'INFORMATION' ? 'Информации' :
                 task.ministry === 'SPORT' ? 'Спорта' :
                 task.ministry === 'CARE' ? 'Заботы' : task.ministry}
              </span>
            )}
          </div>
        </div>

        {/* Топ выполнивших */}
        {task.taskType === 'PUBLIC' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Топ выполнивших</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => loadTopPerformers(3)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    topLimit === 3
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Топ 3
                </button>
                <button
                  onClick={() => loadTopPerformers(5)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    topLimit === 5
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Топ 5
                </button>
                <button
                  onClick={() => loadTopPerformers(10)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    topLimit === 10
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Топ 10
                </button>
              </div>
            </div>
            {loadingTop ? (
              <p className="text-gray-500 text-center py-4">Загрузка...</p>
            ) : topPerformers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Место</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ученик</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Класс</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Министерство</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Выполнено</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((performer, index) => (
                      <tr key={performer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{performer.user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{performer.user.fullClass || performer.user.class || '—'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {performer.user.parliamentMember?.ministry 
                            ? (performer.user.parliamentMember.ministry === 'LAW_AND_ORDER' ? 'Права и порядка' :
                               performer.user.parliamentMember.ministry === 'INFORMATION' ? 'Информации' :
                               performer.user.parliamentMember.ministry === 'SPORT' ? 'Спорта' :
                               performer.user.parliamentMember.ministry === 'CARE' ? 'Заботы' : performer.user.parliamentMember.ministry)
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {performer.updatedAt 
                            ? new Date(performer.updatedAt).toLocaleString('ru-RU')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Пока никто не выполнил эту задачу</p>
            )}
          </div>
        )}

        {!instance ? (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Вы еще не взяли эту задачу</p>
            <button
              onClick={handleTakeTask}
              disabled={submitting}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {submitting ? 'Загрузка...' : 'Взять задачу'}
            </button>
          </div>
        ) : instance.status === 'COMPLETED' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-700 font-semibold">✅ Задача выполнена и одобрена!</p>
            {instance.feedback && (
              <p className="text-green-600 mt-2">{instance.feedback}</p>
            )}
          </div>
        ) : instance.status === 'IN_REVIEW' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <p className="text-yellow-700 font-semibold">⏳ Задача отправлена на проверку</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Выполнение задачи</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Видео (через Telegram)
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="Ссылка на видео из Telegram"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={openTelegram}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Telegram
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Нажмите кнопку Telegram, чтобы загрузить видео через бота
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ссылка на работу
              </label>
              <input
                type="url"
                value={formData.workLink}
                onChange={(e) => setFormData({ ...formData, workLink: e.target.value })}
                placeholder="https://example.com/my-work"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Описание выполненной работы
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Опишите, что вы сделали..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting || (!formData.videoUrl && !formData.workLink)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex-1"
              >
                {submitting ? 'Отправка...' : 'Отправить на проверку'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

