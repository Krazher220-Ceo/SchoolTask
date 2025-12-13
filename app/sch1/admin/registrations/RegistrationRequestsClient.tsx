'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Clock, User, Mail, Phone, Key, BookOpen } from 'lucide-react'
import { ministryNames } from '@/lib/utils'

export default function RegistrationRequestsClient({ requests }: { requests: any[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [approveData, setApproveData] = useState<{ [key: string]: { role: string; ministry?: string; password?: string } }>({})

  const handleApprove = async (requestId: string) => {
    const data = approveData[requestId] || { role: 'STUDENT' }
    if ((data.role === 'MEMBER' || data.role === 'MINISTER') && !data.ministry) {
      alert('Для участников парламента необходимо указать министерство')
      return
    }

    setProcessing(requestId)
    try {
      const res = await fetch(`/api/registration/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        alert(`Заявка одобрена! Пароль пользователя: ${result.password}\nОтправьте его пользователю.`)
        router.refresh()
      } else {
        alert(result.error || 'Ошибка при одобрении заявки')
      }
    } catch (error) {
      alert('Ошибка при одобрении заявки')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId: string) => {
    const feedback = prompt('Укажите причину отклонения (необязательно):')
    if (feedback === null) return // Пользователь отменил

    setProcessing(requestId)
    try {
      const res = await fetch(`/api/registration/${requestId}/approve`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })

      if (res.ok) {
        alert('Заявка отклонена')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при отклонении заявки')
      }
    } catch (error) {
      alert('Ошибка при отклонении заявки')
    } finally {
      setProcessing(null)
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING')
  const processedRequests = requests.filter(r => r.status !== 'PENDING')

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="h-6 w-6 mr-2 text-yellow-600" />
          Ожидающие рассмотрения ({pendingRequests.length})
        </h2>

        {pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border-2 border-gray-200 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-semibold text-gray-700">ФИО:</span>
                      <span className="ml-2 text-gray-900">{request.fullName}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-semibold text-gray-700">Телефон:</span>
                      <span className="ml-2 text-gray-900">{request.phone}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-semibold text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-900">{request.email}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Key className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-semibold text-gray-700">Логин:</span>
                      <span className="ml-2 text-gray-900">{request.login}</span>
                    </div>
                    {request.bilimClassLogin && (
                      <div className="flex items-center mb-2">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-semibold text-gray-700">Bilim class:</span>
                        <span className="ml-2 text-gray-900">{request.bilimClassLogin}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Роль:
                      </label>
                      <select
                        value={approveData[request.id]?.role || 'STUDENT'}
                        onChange={(e) => {
                          setApproveData({
                            ...approveData,
                            [request.id]: {
                              ...approveData[request.id],
                              role: e.target.value,
                            },
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="STUDENT">Ученик</option>
                        <option value="MEMBER">Участник парламента</option>
                        <option value="MINISTER">Министр</option>
                      </select>
                    </div>
                    {(approveData[request.id]?.role === 'MEMBER' || approveData[request.id]?.role === 'MINISTER') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Министерство:
                        </label>
                        <select
                          value={approveData[request.id]?.ministry || ''}
                          onChange={(e) => {
                            setApproveData({
                              ...approveData,
                              [request.id]: {
                                ...approveData[request.id],
                                ministry: e.target.value,
                              },
                            })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">Выберите министерство</option>
                          {Object.entries(ministryNames).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Пароль (оставьте пустым для автогенерации):
                      </label>
                      <input
                        type="text"
                        value={approveData[request.id]?.password || ''}
                        onChange={(e) => {
                          setApproveData({
                            ...approveData,
                            [request.id]: {
                              ...approveData[request.id],
                              password: e.target.value,
                            },
                          })
                        }}
                        placeholder="Автогенерация"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {processing === request.id ? 'Обработка...' : 'Одобрить'}
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Нет заявок, ожидающих рассмотрения</p>
        )}
      </div>

      {processedRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Обработанные заявки ({processedRequests.length})
          </h2>
          <div className="space-y-2">
            {processedRequests.map((request) => (
              <div
                key={request.id}
                className={`border rounded-lg p-4 ${
                  request.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{request.fullName}</span>
                    <span className="text-gray-600 ml-2">({request.email})</span>
                    {request.status === 'APPROVED' && request.user && (
                      <span className="text-green-700 ml-2">✓ Аккаунт создан</span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {request.status === 'APPROVED' ? 'Одобрена' : 'Отклонена'}
                  </span>
                </div>
                {request.feedback && (
                  <p className="text-sm text-gray-600 mt-2">{request.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


