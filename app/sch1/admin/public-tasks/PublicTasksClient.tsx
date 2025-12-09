'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, ExternalLink, Video, Link as LinkIcon } from 'lucide-react'

export default function PublicTasksClient({ instances }: { instances: any[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)

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

