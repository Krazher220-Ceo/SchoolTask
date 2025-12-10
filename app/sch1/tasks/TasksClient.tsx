'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Award } from 'lucide-react'
import { ministryNames } from '@/lib/utils'

export default function TasksClient({ tasks, users, initialFilters }: any) {
  const router = useRouter()
  const [filters, setFilters] = useState({
    status: initialFilters?.status || '',
    ministry: initialFilters?.ministry || '',
    assignedToId: initialFilters?.assignedToId || '',
  })

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    router.push(`/sch1/tasks?${params.toString()}`)
  }

  return (
    <>
      {/* Фильтры */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Статус</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Все статусы</option>
              <option value="NEW">Новая</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="IN_REVIEW">На проверке</option>
              <option value="COMPLETED">Выполнено</option>
              <option value="REJECTED">Отклонено</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Министерство</label>
            <select
              value={filters.ministry}
              onChange={(e) => updateFilter('ministry', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Все министерства</option>
              <option value="LAW_AND_ORDER">Права и порядка</option>
              <option value="INFORMATION">Информации</option>
              <option value="SPORT">Спорта</option>
              <option value="CARE">Заботы</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Исполнитель</label>
            <select
              value={filters.assignedToId}
              onChange={(e) => updateFilter('assignedToId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Все исполнители</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Список задач */}
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task: any) => {
            // Определяем правильную ссылку в зависимости от типа задачи
            const taskLink = task.taskType === 'PUBLIC' 
              ? `/sch1/public-tasks/${task.id}`
              : task.targetAudience === 'STUDENT' || task.targetAudience === 'PUBLIC'
              ? `/sch1/public-tasks/${task.id}`
              : `/sch1/tasks/${task.id}`
            
            return (
            <Link
              key={task.id}
              href={taskLink}
              className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                      task.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status === 'COMPLETED' ? 'Выполнено' :
                       task.status === 'IN_PROGRESS' ? 'В работе' :
                       task.status === 'IN_REVIEW' ? 'На проверке' :
                       task.status === 'REJECTED' ? 'Отклонено' : 'Новая'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority === 'CRITICAL' ? 'Критический' :
                       task.priority === 'HIGH' ? 'Высокий' :
                       task.priority === 'MEDIUM' ? 'Средний' : 'Низкий'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{task.description.substring(0, 150)}...</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {ministryNames[task.ministry]}
                    </div>
                    {task.assignedTo && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {task.assignedTo.name}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      {task.targetAudience === 'STUDENT' || task.targetAudience === 'PUBLIC'
                        ? `${task.epReward || 0} EP`
                        : `${task.xpReward || 0} XP`}
                    </div>
                    {task.deadline && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        До: {new Date(task.deadline).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                    {task.reports.length > 0 && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                        Отчет на проверке
                      </span>
                    )}
                    {task.taskType === 'PUBLIC' && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        Общественная
                      </span>
                    )}
                    {task.publicTaskInstances && task.publicTaskInstances.length > 0 && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        Взята
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            )
          })
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Задач не найдено</p>
          </div>
        )}
      </div>
    </>
  )
}

