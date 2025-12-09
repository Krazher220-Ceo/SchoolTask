'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Eye, Edit, AlertTriangle } from 'lucide-react'
import { ministryNames } from '@/lib/utils'

export default function TasksAdminClient({ tasks }: { tasks: any[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)

  const handleDelete = async (taskId: string, taskTitle: string) => {
    if (!confirm(`Вы уверены, что хотите удалить задачу "${taskTitle}"?`)) {
      return
    }

    setDeleting(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Задача успешно удалена')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при удалении задачи')
      }
    } catch (error) {
      alert('Ошибка при удалении задачи')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm(`ВНИМАНИЕ! Вы уверены, что хотите удалить ВСЕ задачи (${tasks.length})? Это действие нельзя отменить!`)) {
      return
    }

    if (!confirm('Это действие удалит ВСЕ задачи безвозвратно. Продолжить?')) {
      return
    }

    setDeletingAll(true)
    try {
      const res = await fetch('/api/tasks/delete-all', {
        method: 'DELETE',
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Удалено задач: ${data.count}`)
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при удалении всех задач')
      }
    } catch (error) {
      alert('Ошибка при удалении всех задач')
    } finally {
      setDeletingAll(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="font-semibold text-red-900">Опасная зона</h3>
              <p className="text-sm text-red-700">Удаление всех задач - необратимое действие</p>
            </div>
          </div>
          <button
            onClick={handleDeleteAll}
            disabled={deletingAll}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deletingAll ? 'Удаление...' : `Удалить все задачи (${tasks.length})`}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Для кого</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Министерство</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Награда</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-500">{task.description.substring(0, 50)}...</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {task.taskType === 'PUBLIC' ? 'Общественная' : 'Приватная'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {task.targetAudience === 'PARLIAMENT_MEMBER' ? 'Парламент' :
                   task.targetAudience === 'STUDENT' ? 'Ученики' :
                   task.targetAudience === 'PUBLIC' ? 'Общественная' : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {task.ministry ? (ministryNames[task.ministry] || task.ministry) : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    task.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {task.xpReward ? `${task.xpReward} XP` : task.epReward ? `${task.epReward} EP` : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/sch1/tasks/${task.id}`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Просмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(task.id, task.title)}
                      disabled={deleting === task.id}
                      className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Нет задач</p>
        </div>
      )}
    </div>
  )
}

