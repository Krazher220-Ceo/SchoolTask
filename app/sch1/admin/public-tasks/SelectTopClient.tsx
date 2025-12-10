'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Check, X } from 'lucide-react'

export default function SelectTopClient({ task }: { task: any }) {
  const router = useRouter()
  const [instances, setInstances] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [awarding, setAwarding] = useState(false)

  useEffect(() => {
    // Загружаем все завершенные инстансы этой задачи
    fetch(`/api/public-tasks/${task.id}/all-instances`)
      .then(res => res.json())
      .then(data => {
        if (data.instances) {
          setInstances(data.instances)
          // Если топ уже выбран, отмечаем выбранные
          if (task.selectedTopInstances) {
            const selected = JSON.parse(task.selectedTopInstances)
            setSelectedIds(new Set(selected))
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [task.id, task.selectedTopInstances])

  const toggleSelection = (instanceId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(instanceId)) {
      newSelected.delete(instanceId)
    } else {
      if (newSelected.size >= (task.topRanking || 10)) {
        alert(`Можно выбрать максимум ${task.topRanking} инстансов`)
        return
      }
      newSelected.add(instanceId)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectTop = async () => {
    if (selectedIds.size === 0) {
      alert('Выберите хотя бы один инстанс')
      return
    }

    if (selectedIds.size > (task.topRanking || 10)) {
      alert(`Можно выбрать максимум ${task.topRanking} инстансов`)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/public-tasks/${task.id}/select-top`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceIds: Array.from(selectedIds),
        }),
      })

      if (res.ok) {
        alert(`Топ ${task.topRanking} успешно выбран!`)
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при выборе топа')
      }
    } catch (error) {
      alert('Ошибка при выборе топа')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAwardTop = async () => {
    if (!confirm('Начислить баллы за топ? Это действие нельзя отменить.')) {
      return
    }

    setAwarding(true)
    try {
      const res = await fetch('/api/public-tasks/award-top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Баллы успешно начислены! Награждено ${data.awarded?.length || 0} участников.`)
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при начислении баллов')
      }
    } catch (error) {
      alert('Ошибка при начислении баллов')
    } finally {
      setAwarding(false)
    }
  }

  const isDeadlinePassed = task.deadline && new Date(task.deadline) < new Date()
  const canSelectTop = !isDeadlinePassed && !task.topAwarded
  const canAwardTop = isDeadlinePassed && task.selectedTopInstances && !task.topAwarded

  if (!task.topRanking) {
    return null // Не показываем, если топ не установлен
  }

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
          Топ {task.topRanking}
        </h3>
        {task.topAwarded && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            Баллы начислены
          </span>
        )}
      </div>

      {canSelectTop && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Выберите до {task.topRanking} лучших работ из {instances.length} завершенных. 
            После дедлайна баллы будут начислены автоматически.
          </p>
          {task.selectedTopInstances && (
            <p className="text-sm text-yellow-600 mb-2">
              ⚠️ Топ уже выбран. Вы можете изменить выбор до окончания дедлайна.
            </p>
          )}
        </div>
      )}

      {canAwardTop && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            Дедлайн прошел. Нажмите кнопку ниже, чтобы начислить баллы за топ.
          </p>
          <button
            onClick={handleAwardTop}
            disabled={awarding}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {awarding ? 'Начисление...' : 'Начислить баллы за топ'}
          </button>
        </div>
      )}

      {instances.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Нет завершенных инстансов</p>
      ) : (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedIds.has(instance.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => canSelectTop && toggleSelection(instance.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{instance.user.name}</div>
                    {instance.user.fullClass && (
                      <div className="text-sm text-gray-500">{instance.user.fullClass}</div>
                    )}
                    {instance.description && (
                      <div className="text-sm text-gray-600 mt-1">{instance.description.substring(0, 100)}...</div>
                    )}
                    {instance.topPosition && (
                      <div className="text-sm font-semibold text-yellow-600 mt-1">
                        Позиция в топе: {instance.topPosition}
                      </div>
                    )}
                  </div>
                  {canSelectTop && (
                    <div className="ml-4">
                      {selectedIds.has(instance.id) ? (
                        <Check className="h-6 w-6 text-primary-600" />
                      ) : (
                        <div className="h-6 w-6 border-2 border-gray-300 rounded" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {canSelectTop && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Выбрано: {selectedIds.size} / {task.topRanking}
              </div>
              <button
                onClick={handleSelectTop}
                disabled={submitting || selectedIds.size === 0}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {submitting ? 'Сохранение...' : 'Сохранить топ'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

