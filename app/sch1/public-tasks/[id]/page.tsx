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
  const [formData, setFormData] = useState({
    videoUrl: '',
    workLink: '',
    description: '',
  })

  useEffect(() => {
    fetch(`/api/tasks?id=${taskId}`)
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setTask(data)
          // Проверяем, взял ли пользователь задачу
          if (data.publicTaskInstances && data.publicTaskInstances.length > 0) {
            setInstance(data.publicTaskInstances[0])
            if (data.publicTaskInstances[0].videoUrl || data.publicTaskInstances[0].workLink) {
              setFormData({
                videoUrl: data.publicTaskInstances[0].videoUrl || '',
                workLink: data.publicTaskInstances[0].workLink || '',
                description: data.publicTaskInstances[0].description || '',
              })
            }
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [taskId])

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
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_bot_username'
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
          </div>
        </div>

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

