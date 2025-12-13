'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, UserPlus } from 'lucide-react'

export default function TaskActions({ task }: { task: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Ошибка при обновлении статуса')
      }
    } catch (error) {
      alert('Ошибка при обновлении статуса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t">
      {task.status === 'NEW' && (
        <button
          onClick={() => updateStatus('IN_PROGRESS')}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Взять в работу
        </button>
      )}
      {task.status === 'IN_PROGRESS' && (
        <button
          onClick={() => updateStatus('NEW')}
          disabled={loading}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center disabled:opacity-50"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Вернуть в новые
        </button>
      )}
    </div>
  )
}


