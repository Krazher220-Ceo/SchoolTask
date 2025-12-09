'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, ExternalLink, Video, Link as LinkIcon, Trophy } from 'lucide-react'

export default function PublicTasksClient({ instances }: { instances: any[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [topData, setTopData] = useState<Record<string, { top: any[], limit: number }>>({})
  const [loadingTop, setLoadingTop] = useState<Record<string, boolean>>({})

  const handleApprove = async (instanceId: string) => {
    const feedback = prompt('Комментарий (необязательно):')
    if (feedback === null) return

    setProcessing(instanceId)
    try {
      const res = await fetch(`/api/public-tasks/${instanceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })

      if (res.ok) {
        alert('Задача одобрена! EP начислены.')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при одобрении')
      }
    } catch (error) {
      alert('Ошибка при одобрении')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (instanceId: string) => {
    const feedback = prompt('Причина отклонения:')
    if (feedback === null) return

    setProcessing(instanceId)
    try {
      const res = await fetch(`/api/public-tasks/${instanceId}/approve`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })

      if (res.ok) {
        alert('Задача отклонена')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при отклонении')
      }
    } catch (error) {
      alert('Ошибка при отклонении')
    } finally {
      setProcessing(null)
    }
  }

  const loadTop = async (taskId: string, limit: 3 | 5 | 10) => {
    setLoadingTop(prev => ({ ...prev, [taskId]: true }))
    try {
      const res = await fetch(`/api/public-tasks/top?taskId=${taskId}&limit=${limit}`)
      if (res.ok) {
        const data = await res.json()
        setTopData(prev => ({ ...prev, [taskId]: { top: data.top || [], limit } }))
      }
    } catch (error) {
      console.error('Ошибка загрузки топа:', error)
    } finally {
      setLoadingTop(prev => ({ ...prev, [taskId]: false }))
    }
  }

  if (instances.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500">Нет задач на проверке</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {instances.map((instance) => (
        <div key={instance.id} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{instance.task.title}</h3>
              <p className="text-gray-600 mb-4">{instance.task.description}</p>
              
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Ученик:</p>
                <p className="text-gray-900">{instance.user.name}</p>
                {instance.user.class && (
                  <p className="text-gray-600 text-sm">{instance.user.class} класс</p>
                )}
                <p className="text-gray-500 text-sm">{instance.user.email}</p>
              </div>

              {instance.description && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Описание работы:</p>
                  <p className="text-gray-600">{instance.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 mb-4">
                {instance.videoUrl && (
                  <a
                    href={instance.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Видео
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
                {instance.workLink && (
                  <a
                    href={instance.workLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Ссылка на работу
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <p>Награда: {instance.task.epReward} EP</p>
                <p>Отправлено: {new Date(instance.createdAt).toLocaleString('ru-RU')}</p>
              </div>

              {/* Кнопка просмотра топа */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Топ выполнивших:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadTop(instance.task.id, 3)}
                      className={`px-2 py-1 text-xs rounded transition ${
                        topData[instance.task.id]?.limit === 3
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Топ 3
                    </button>
                    <button
                      onClick={() => loadTop(instance.task.id, 5)}
                      className={`px-2 py-1 text-xs rounded transition ${
                        topData[instance.task.id]?.limit === 5
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Топ 5
                    </button>
                    <button
                      onClick={() => loadTop(instance.task.id, 10)}
                      className={`px-2 py-1 text-xs rounded transition ${
                        topData[instance.task.id]?.limit === 10
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Топ 10
                    </button>
                  </div>
                </div>
                {loadingTop[instance.task.id] ? (
                  <p className="text-xs text-gray-500">Загрузка...</p>
                ) : topData[instance.task.id]?.top && topData[instance.task.id].top.length > 0 ? (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 font-semibold text-gray-700">Место</th>
                          <th className="text-left py-2 px-2 font-semibold text-gray-700">Ученик</th>
                          <th className="text-left py-2 px-2 font-semibold text-gray-700">Класс</th>
                          <th className="text-left py-2 px-2 font-semibold text-gray-700">Выполнено</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topData[instance.task.id].top.slice(0, topData[instance.task.id].limit).map((performer: any, index: number) => (
                          <tr key={performer.id} className="border-b border-gray-100">
                            <td className="py-2 px-2">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-medium text-gray-900">{performer.user.name}</td>
                            <td className="py-2 px-2 text-gray-600">{performer.user.fullClass || performer.user.class || '—'}</td>
                            <td className="py-2 px-2 text-gray-600">
                              {performer.updatedAt 
                                ? new Date(performer.updatedAt).toLocaleDateString('ru-RU')
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : topData[instance.task.id] ? (
                  <p className="text-xs text-gray-500 mt-2">Пока никто не выполнил</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleApprove(instance.id)}
              disabled={processing === instance.id}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              <Check className="h-4 w-4 mr-2" />
              {processing === instance.id ? 'Обработка...' : `Одобрить (+${instance.task.epReward} EP)`}
            </button>
            <button
              onClick={() => handleReject(instance.id)}
              disabled={processing === instance.id}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              <X className="h-4 w-4 mr-2" />
              Отклонить
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

