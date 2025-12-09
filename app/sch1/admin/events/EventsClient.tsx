'use client'

import { useState } from 'react'
import { Calendar, MapPin, Users, Edit, Trash2, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Event {
  id: string
  title: string
  description: string
  ministry: string | null
  category: string
  date: string
  location: string | null
  maxParticipants: number | null
  status: string
  participants: any[]
  createdAt: string
  updatedAt: string
}

interface EventsClientProps {
  initialEvents: Event[]
}

const ministries = [
  { value: 'LAW_AND_ORDER', label: 'Права и порядка' },
  { value: 'INFORMATION', label: 'Информации' },
  { value: 'SPORT', label: 'Спорта' },
  { value: 'CARE', label: 'Заботы' },
]

const statuses = [
  { value: 'UPCOMING', label: 'Предстоит' },
  { value: 'IN_PROGRESS', label: 'В процессе' },
  { value: 'COMPLETED', label: 'Завершено' },
  { value: 'CANCELLED', label: 'Отменено' },
]

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ministry: '',
    category: '',
    date: '',
    location: '',
    maxParticipants: '',
    status: 'UPCOMING',
  })

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        description: event.description,
        ministry: event.ministry || '',
        category: event.category,
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location || '',
        maxParticipants: event.maxParticipants?.toString() || '',
        status: event.status,
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        description: '',
        ministry: '',
        category: '',
        date: '',
        location: '',
        maxParticipants: '',
        status: 'UPCOMING',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingEvent 
      ? `/api/events/${editingEvent.id}`
      : '/api/events'
    
    const method = editingEvent ? 'PATCH' : 'POST'
    
    const data = {
      ...formData,
      ministry: formData.ministry || null,
      location: formData.location || null,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Ошибка при сохранении мероприятия')
        return
      }

      const savedEvent = await response.json()
      
      if (editingEvent) {
        setEvents(events.map(e => e.id === savedEvent.id ? savedEvent : e))
      } else {
        setEvents([savedEvent, ...events])
      }

      closeModal()
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка при сохранении мероприятия')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        alert('Ошибка при удалении мероприятия')
        return
      }

      setEvents(events.filter(e => e.id !== id))
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка при удалении мероприятия')
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Все мероприятия</h2>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Создать мероприятие
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(event)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(event.date), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </div>
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
              )}
              {event.maxParticipants && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {event.participants.length} / {event.maxParticipants} участников
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-600">{event.category}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                event.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {statuses.find(s => s.value === event.status)?.label || event.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEvent ? 'Редактировать мероприятие' : 'Создать мероприятие'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Описание *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Министерство
                  </label>
                  <select
                    value={formData.ministry}
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Не указано</option>
                    {ministries.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Категория *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Дата и время *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Статус *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    {statuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Место проведения
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Макс. участников
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  {editingEvent ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

